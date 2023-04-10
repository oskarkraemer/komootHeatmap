import math


def deg2rad(deg) -> float:
    """
    :param deg: angle in degrees
    :return: angle in radians
    """
    return deg * 0.0174532925199433


def dist(p1: tuple, p2: tuple) -> float:
    """
    :param p1: first coordinate tuple (point)
    :param p2: second coordinate tuple (point)
    :return: distance between both points
    """
    earth_radius = 6371
    x1 = p1[0]
    y1 = p1[1]
    x2 = p2[0]
    y2 = p2[1]
    dLat = deg2rad(x2 - x1)
    dLng = deg2rad(y2 - y1)
    lat1 = deg2rad(x1)
    lat2 = deg2rad(x2)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + math.sin(dLng / 2) * math.sin(dLng / 2) * math.cos(lat1) * math.cos(
        lat2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius * c


def time_delta(t1: int, t2: int) -> float:
    """
    :param t1: first timestamp
    :param t2: second timestamp
    :return: time delta
    """
    return (t2 - t1) / 3600000


def speed(s: float, t: float) -> float:
    """
    :param s: distance
    :param t: time
    :return: speed
    """
    return s / t


class Tour:
    def __init__(self, data):
        """
        :param data: Data scraped from tour page as JSON
        """
        self.data = data
        print(data.keys())
        self.coordinates = [(i['lat'], i['lng']) for i in
                            data['coordinates']['items']]
        self.timestamps = [i['t'] for i in data['coordinates']['items']]
        self.altitudes = [i['alt'] for i in data['coordinates']['items']]
        self.speed = self.speed()

    def status(self) -> str:
        """
        :return: Tour is private or public
        """
        return self.data['status']

    def sport(self) -> str:
        """
        :return: Type of sport
        """
        return self.data['sport']

    def roundtrip(self) -> bool:
        """
        :return: Tour was a roundtrip or not
        """
        return True if self.data['roundtrip'] == "true" else False

    def id(self) -> int:
        """
        :return: Komoot tour ID
        """
        return self.data['id']

    def type(self) -> str:
        """
        :return: Type of recorded tour data (planned, done, recorded, ...)
        """
        return self.data['type']

    def name(self) -> str:
        """
        :return: Title of the tour
        """
        return self.data['name']

    def distance(self) -> float:
        """
        :return: Covered distance
        """
        return round(self.data['distance'] / 1000, 2)

    def duration(self) -> int:
        """
        :return: Time needed
        """
        return self.data['duration']

    # TODO: Convert to datetime object
    def date(self):
        return self.data['date']

    # TODO: Convert to datetime object
    def changed_at(self):
        return self.data['changed_at']

    def kcal_active(self) -> int:
        """
        :return: Actively burned calories
        """
        return self.data['kcal_active']

    def kcal_resting(self) -> int:
        """
        :return: Calories burned during breaks
        """
        return self.data['kcal_resting']

    def time_in_motion(self) -> int:
        """
        :return: Time spent in motion
        """
        return self.data['time_in_motion']

    def elevation_up(self) -> float:
        """
        :return: Positive altitude meters
        """
        return self.data['elevation_up']

    def elevation_down(self) -> float:
        """
        :return: Negative altitude meters
        """
        return self.data['elevation_down']

    def speed(self):
        v = []
        for i in range(1, len(self.coordinates)):
            p1 = self.coordinates[i - 1]
            p2 = self.coordinates[i]
            t1 = self.timestamps[i - 1]
            t2 = self.timestamps[i]
            s = dist(p1, p2)
            t = time_delta(t1, t2)
            v.append(speed(s, t))
        return v
