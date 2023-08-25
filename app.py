from flask import Flask, render_template, request, redirect, url_for, Response, make_response
import get_data
import time
import json

app = Flask(__name__)


@app.route('/')
def home():
    if not is_logged_in():
        return redirect(url_for('login'))

    email = request.cookies.get('email')
    password = request.cookies.get('password')

    return render_template('index.html', display_name=get_data.get_display_name(email, password))


@app.route('/tours_data')
def gpx():
    if not is_logged_in():
        return Response(status=401)

    gpx_data = get_data.get_all_tours_gpx(request.cookies.get('email'), request.cookies.get('password'))
    if not gpx_data:
        resp = make_response("An error has occurred!", 500)
        return resp

    return Response(json.dumps(gpx_data), mimetype='application/json')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        #Check if credentials are correct
        if not get_data.auth(email, password):
            return render_template('login.html', error=True)
        
        #Set cookies
        resp = make_response(redirect(url_for('home')))

        max_age = 60*60*24*30*6 #6 months
        experation = time.time() + max_age

        resp.set_cookie('email', email, max_age=max_age, expires=experation)
        resp.set_cookie('password', password, max_age=max_age, expires=experation)

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
    if 'email' not in cookies or 'password' not in cookies:
        return False
    
    if not get_data.auth(cookies.get('email'), cookies.get('password')):
        return False
    
    return True

if __name__ == '__main__':
    app.secret_key = 'pU4VmigPwFcA1337'

    app.run(debug=False, host='0.0.0.0', port=80)
