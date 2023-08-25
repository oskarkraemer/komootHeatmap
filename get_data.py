from requests.auth import HTTPBasicAuth
import time

import komPYoot

login_url = "https://account.komoot.com/v1/signin"


def auth(email, password) -> bool:
	a = komPYoot.API()

	return a.login(email, password)


"""
Gets GPX-data from ALL tours of a user

Returns a list of GPX-files if successful, False otherwise
"""
def get_all_tours_gpx(email, password, planned = False, recorded = True):
	#Check if both planned and recorded are false
	if not planned and not recorded:
		return False

	#Authenticate
	a = komPYoot.API()

	if not a.login(email, password):
		return False

	#Get all tours
	tours = a.get_user_tours_list(tour_type=komPYoot.TourType.RECORDED)
	
	gpx_files = []
	for tour in tours:
		begin_time = time.time()
		gpx_files.append(a.download_tour_gpx(tour["id"]))
		print(f"Took: {time.time() - begin_time}")
	
	return gpx_files

"""
Gets the user's display name

Returns the display name if successful, False otherwise
"""
def get_display_name(email, password):
	#Authenticate
	a = komPYoot.API()

	if not a.login(email, password):
		return False

	return a.get_user_disp_name()