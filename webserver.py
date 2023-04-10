from flask import Flask, render_template, request, redirect, url_for, Response, session
import get_data
import time
import json

#client_id = "3036801734530"

#get_data.auth("05262020@protonmail.com", "!file")
#tours = get_data.get_tours(client_id)

app = Flask(__name__)

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/')
def home():
    if 'userid' not in session:
        return redirect(url_for('login'))

    if not get_data.check_auth(session['userid']):
        return redirect(url_for('login'))
    
    return render_template('index.html')


@app.route('/tours_data')
def gpx():
    gpx_files = []
    
    tours = get_data.get_tours(session['userid'])

    for tour in tours:
        gpx_files.append(get_data.get_tour_gpx(tour['id']))

    #reutrn array as json
    return Response(json.dumps(gpx_files), mimetype='application/json')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        userid = request.form['userid']

        #either email or password is wrong
        if not get_data.auth(email, password):
            return redirect(url_for('login'))
        
        #Userid is most likely wrong
        tours = get_data.get_tours(userid)
        if tours == False:
            return redirect(url_for('login'))
        
        #Everything is fine
        session['email'] = email
        session['password'] = password
        session['userid'] = userid

        
        return redirect(url_for('home'))
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

if __name__ == '__main__':
    app.secret_key = 'cheeser9387fdj9439ds'
    app.config['SESSION_TYPE'] = 'filesystem'

    app.run(debug=False)
