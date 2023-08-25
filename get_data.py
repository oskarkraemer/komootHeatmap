import kompyoot

def auth(email, password) -> bool:
	a = kompyoot.API()

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
	a = kompyoot.API()

	if not a.login(email, password):
		return False

	#Get all tours
	tours = a.get_user_tours_list(tour_type=kompyoot.TourType.RECORDED)
	
	gpx_files = []
	for tour in tours:
		gpx_files.append(a.download_tour_gpx(tour["id"]))
	
	return gpx_files

"""
Gets the user's display name

Returns the display name if successful, False otherwise
"""
def get_display_name(email, password):
	#Authenticate
	a = kompyoot.API()

	if not a.login(email, password):
		return False

	return a.get_user_disp_name()