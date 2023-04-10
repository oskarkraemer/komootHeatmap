from flask import Flask, render_template, request, redirect, url_for, Response, make_response
import get_data
import time
import json

#client_id = "3036801734530"

#get_data.auth("05262020@protonmail.com", "!file")
#tours = get_data.get_tours(client_id)

app = Flask(__name__)


@app.route('/')
def home():
    if not is_logged_in():
        return redirect(url_for('login'))

    return render_template('index.html')


@app.route('/tours_data')
def gpx():
    if not is_logged_in():
        return Response(status=401)

    gpx_data = get_data.get_all_tours_gpx(request.cookies.get('email'), request.cookies.get('password'), request.cookies.get('userid'))

    return Response(json.dumps(gpx_data), mimetype='application/json')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        userid = request.form['userid']

        #Check if credentials are correct
        if not get_data.auth(email, password, userid):
            return redirect(url_for('login'))
        
        #Everything is fine / set cookies
        resp = make_response(redirect(url_for('home')))

        resp.set_cookie('email', email)
        resp.set_cookie('password', password)
        resp.set_cookie('userid', userid)

        return resp
    else:
        return render_template('login.html')


@app.route('/pin-icon-start.png')
def pin_icon_start():
    return Response(status=418)

@app.route('/pin-icon-end.png')
def pin_icon_end():
    return Response(status=418)

@app.route('/pin-shadow.png')
def pin_shadow():
    return Response(status=418)


"""
Check if auth cookies are valid
"""
def is_logged_in():
    cookies = request.cookies
    if 'userid' not in cookies or 'email' not in cookies or 'password' not in cookies:
        return False
    
    if not get_data.auth(cookies.get('email'), cookies.get('password'), cookies.get('userid')):
        return False
    
    return True

if __name__ == '__main__':
    app.secret_key = 'pU4VmigPwFcA1337'

    app.run(debug=False)
