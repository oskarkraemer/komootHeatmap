import kompyoot

def auth(email, password) -> dict:
	a = kompyoot.API()

	return {"result": a.login(email, password), 'api': a}


"""
Gets GPX-data from ALL tours of a user

Returns a list of GPX-files if successful, False otherwise
"""
def get_tour_gpx(a, tourid):
	api = kompyoot.API()
	api.from_json(a)

	#Get specific tour
	return api.download_tour_gpx(tourid)

def get_tours_list(a, planned = False, recorded = True) -> list:
	api = kompyoot.API()
	api.from_json(a)

	#Check if both planned and recorded are false
	if not planned and not recorded:
		return False

	#Get all tours
	tours = api.get_user_tours_list(tour_type=kompyoot.TourType.RECORDED)

	#filter tours dict to only include 'id' and 'sport' keys
	tours_id = []
	for tour in tours:
		tours_id.append({'id': tour['id'], 'sport': tour['sport']})
	
	return tours_id

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