#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Aug  2 12:51:22 2022.

@author: Nishad Mandlik
"""

from enum import IntFlag, auto
import requests
import warnings
import xml.etree.ElementTree as ET
import json

_LOGIN_URL = "https://api.komoot.de/v006/account/email/%s/"
_TOURS_URL = "https://api.komoot.de/v007/users/%s/tours/"
_TOUR_DL_GPX_URL = "https://api.komoot.de/v007/tours/%s.gpx"
_TOUR_UL_GPX_URL = "https://api.komoot.de/v007/tours/"


class AutoFlag(IntFlag):
    """Flag Enum with auto value generation."""

    def __new__(cls, flag_name):
        """
        Create custom element with Flag-Enum value.

        Parameters
        ----------
        flag_name : str
            Flag name.

        Returns
        -------
        obj : instance of AutoFlag
            New Flag Enum element.

        """
        val = 2 ** len(cls.__members__)
        obj = int.__new__(cls, val)
        obj._value_ = val
        obj.flag_name = flag_name
        return obj


class TourType(AutoFlag):
    """Flag Enum for Tour Type (Planned, Recorded)."""

    PLANNED = "tour_planned"
    RECORDED = "tour_recorded"


class TourStatus(AutoFlag):
    """Flag Enum for Tour Status (Public, Private)."""

    PUBLIC = "public"
    PRIVATE = "private"


class Sport(AutoFlag):
    """
    Flag Enum for Sports.

    Obtained from https://static.komoot.de/doc/external-api/v007/sports.html
    """

    BIKING = "citybike"
    E_BIKE_TOURING = "e_touringbicycle"
    BIKE_TOURING = "touringbicycle"
    E_ROAD_CYCLING = "e_racebike"
    ROAD_CYCLING = "racebike"
    E_GRAVEL_BIKING = "e_mtb_easy"
    GRAVEL_BIKING = "mtb_easy"
    E_MT_BIKING = "e_mtb"
    MT_BIKING = "mtb"
    MT_BIKING_DOWNHILL = "downhillbike"
    E_MT_BIKING_ENDURO = "e_mtb_advanced"
    MT_BIKING_ENDURO = "mtb_advanced"
    UNICYCLING = "unicycle"
    HIKING = "hike"
    RUNNING = "jogging"
    SKATING = "skaten"
    MOUNTAINEERING = "mountaineering"
    ROCK_CLIMBING = "climbing"
    NORDIC_WALKING = "nordicwalking"
    SKI_TOURING = "skitour"
    CROSS_COUNTRY_SKIING = "nordic"
    ALPINE_SKIING = "skialpin"
    SLEDGING = "sled"
    SNOWBOARDING = "snowboard"
    SNOWSHOEING = "snowshoe"
    OTHER = "other"


class TourOwner(IntFlag):
    """Enum for tour owner (logged-in user or other user)."""

    SELF = auto()
    OTHER = auto()


class API():
    """
    Class for interfacing with the Komoot API.

    Refer to https://static.komoot.de/doc/external-api/v007/index.html
    """

    def __init__(self):
        """
        Initialize a Komoot API object.

        Returns
        -------
        None.

        """
        self.user_details = {}

    def login(self, email_id, password):
        """
        Authenticate user credentials and generate access token for the
        Komoot API.

        Parameters
        ----------
        email_id : str
            Email ID for Komoot account.
        password : str
            Password for Komoot account.

        Returns
        -------
        bool
            True if login is successful, False otherwise.

        """
        self.user_details = {}
        resp = requests.get(_LOGIN_URL % email_id, auth=(email_id, password))
        if (resp.status_code != 200):
            return False
        details = resp.json()
        self.user_details["email"] = email_id
        self.user_details["user_id"] = details["username"]
        self.user_details["disp_name"] = details["user"]["displayname"]
        self.user_details["dp_url"] = (
            details["user"]["imageUrl"]
            if details["user"]["content"]["hasImage"] else None)
        self.user_details["token"] = details["password"]
        return True

    def to_json(self):
        """
        Return a JSON string containing the user details.

        Returns
        -------
        str
            JSON string.

        """
        return json.dumps(self.user_details)

    def from_json(self, json_str):
        """
        Load user details from a JSON string.

        Parameters
        ----------
        json_str : str
            JSON string.

        Returns
        -------
        bool
            True if loading is successful, False otherwise.

        """
        self.user_details = {}
        self.user_details = json.loads(json_str)

        return True

    def get_user_email(self):
        """
        Return the email ID of the logged-in user.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        str.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        return self.user_details["email"]

    def get_user_id(self):
        """
        Return the user ID of the logged-in user.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        str.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        return self.user_details["user_id"]

    def get_user_disp_name(self):
        """
        Return the display name of the logged-in user.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        str.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        return self.user_details["disp_name"]

    def get_user_pic_url(self):
        """
        Return the display picture URL of the logged-in user. If picture is
        not set, None is returned.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        str or None.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        return self.user_details["dp_url"]

    def _parse_flags(self, user_flags, flag_cls):
        flag_names = []
        if (user_flags is not None):
            for flag in flag_cls:
                if (flag & user_flags):
                    flag_names.append(flag.flag_name)
        return (",").join(flag_names)

    def _add_flags_to_req_params(self, params_dict, param_name,
                                 user_flags, flag_cls):
        param_val = self._parse_flags(user_flags, flag_cls)
        if param_val:
            params_dict[param_name] = param_val

    def _filt_tours_status(self, tours, user_flags):
        if (user_flags is None):
            return tours
        tours_filt = []
        for flag in TourStatus:
            if (flag & user_flags):
                tours_filt += [tour for tour in tours
                               if (tour["status"] == flag.flag_name)]
        return tours_filt

    def _filt_tours_owner(self, tours, user_flags):
        if ((user_flags is None) or
                (user_flags == (TourOwner.SELF | TourOwner.OTHER))):
            return tours
        tours_filt = []
        if (TourOwner.SELF & user_flags):
            tours_filt += [tour for tour in tours
                           if (tour["_embedded"]["creator"]["username"] ==
                               self.get_user_id())]

        if (TourOwner.OTHER & user_flags):
            tours_filt += [tour for tour in tours
                           if (tour["_embedded"]["creator"]["username"] !=
                               self.get_user_id())]

        return tours_filt

    def get_user_tours_list(self, tour_type=None, tour_status=None,
                            sport=None, tour_owner=None):
        """
        Get the list of tours for the logged-in user, according to the
        user-defined filters.

        Parameters
        ----------
        tour_type : TourType or None, optional
            Bitwise OR-ed flags for filtering multiple tour types.
            The default is None.
        tour_status : TourStatus or None, optional
            Bitwise OR-ed flags for filtering multiple tour statuses.
            The default is None.
        sport : Sport or None, optional
            Bitwise OR-ed flags for filtering multiple sports.
            The default is None.
        tour_owner: TourOwner or None, optional
            Bitwise OR-ed flags for filtering activities according to creator
            (self or others).
            The default is None.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        tours : list
            List of dictionaries containing details of tours.

        """

        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        params = {}
        self._add_flags_to_req_params(params, "type", tour_type, TourType)
        self._add_flags_to_req_params(params, "sport_types", sport, Sport)
        params["page"] = 0

        tours = []
        while True:
            resp = requests.get(_TOURS_URL % self.user_details["user_id"],
                                params=params,
                                auth=(self.user_details["user_id"],
                                      self.user_details["token"]))
            if (resp.status_code != 200):
                warnings.warn("Request Failed. Tour List May Be Incomplete")
                break

            content = resp.json()
            if (content["page"]["totalElements"] == 0):
                break

            tours += content["_embedded"]["tours"]

            params["page"] += 1
            if (content["page"]["totalPages"] == params["page"]):
                break

        tours = self._filt_tours_status(tours, tour_status)
        tours = self._filt_tours_owner(tours, tour_owner)

        return tours

    def download_tour_gpx(self, tour_id, download_dir = None):
        """
        Download tour in the GPX format.
        If no donnload directory is specified, the GPX data is returned.

        Parameters
        ----------
        tour_id : str
            Tour ID.
        download_dir : str, optional
            Path of the directory where the downloaded tour will be saved.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        str or None
            file_name or GPX data if download is successful, None otherwise.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        resp = requests.get(_TOUR_DL_GPX_URL % tour_id,
                            auth=(self.user_details["user_id"],
                                  self.user_details["token"]))
        if (resp.status_code != 200):
            warnings.warn("Download failed.\nError Code: %d" %
                          resp.status_code)
            return None
        
        if download_dir is not None:
            gpx_txt = resp.text
            gpx_tree = ET.fromstring(gpx_txt)
            file_name = gpx_tree[0][0].text + ".gpx"
            with open(download_dir + "/" + file_name, "w") as f:
                f.write(resp.text)
            
            return file_name
        else:
            return resp.text
        

    def upload_tour_gpx(self, sport, file_path, duration=None):
        """
        Upload a GPX file as a recorded activity.

        Parameters
        ----------
        sport : Sport
            Type of sport for the tour.
        file_path : str
            Path of the GPX file.
        duration : int or None, optional
            Time in motion (in seconds) for the tour. If None, Komoot assumes
            the duration of the entire tour to be the time in motion. The
            default is None.

        Raises
        ------
        RuntimeError
            If no user is logged-in.

        Returns
        -------
        bool
            True, if upload is successful, False otherwise.

        """
        if (self.user_details == {}):
            raise RuntimeError("User Details Not Available. Please Sign In.")
        headers = {"User-Agent": "komPYoot"}
        params = {"data_type": "gpx", "sport": sport.flag_name}
        if duration is not None:
            params["time_in_motion"] = duration
        with open(file_path, "rb") as f:
            data = f.read()
        resp = requests.post(_TOUR_UL_GPX_URL, params=params,
                             headers=headers, data=data,
                             auth=(self.user_details["user_id"],
                                   self.user_details["token"]))
        if (resp.status_code == 201):
            print("Upload Successful. New tour created (ID: %d)." %
                  resp.json()["id"])
            return True
        elif (resp.status_code == 202):
            print("Upload Successful. New tour not created since upload is a "
                  "ducplicate of an existing tour (ID: %d)." %
                  resp.json()["id"])
            return True
        else:
            warnings.warn("Upload Failed.\nError Code: %d" %
                          resp.status_code)
            return False
