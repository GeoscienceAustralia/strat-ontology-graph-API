#!/bin/python3
# -*- coding: utf-8 -*-
"""
Stratnames API 
"""
__license__ = "TBD"  # Open source or proprietary? Apache 2.0, or MIT?
__version__ = "0.1"

import connexion
from connexion.resolver import RestyResolver
from flask_cors import CORS

app = connexion.App(__name__)
app.add_api('openapi.yaml', resolver=RestyResolver('api'))


CORS(app.app)

logo = r"""
 (          (                      )          *        (              (   (     
 )\ )  *   ))\ )   (      *   ) ( /(  (     (  `       )\ )     (     )\ ))\ )  
(()/(` )  /(()/(   )\   ` )  /( )\()) )\    )\))(  (  (()/(     )\   (()/(()/(  
 /(_))( )(_))(_)|(((_)(  ( )(_)|(_)((((_)( ((_)()\ )\  /(_)) ((((_)(  /(_))(_)) 
(_)) (_(_()|_))  )\ _ )\(_(_()) _((_)\ _ )\(_()((_|(_)(_))    )\ _ )\(_))(_))   
/ __||_   _| _ \ (_)_\(_)_   _|| \| (_)_\(_)  \/  | __/ __|   (_)_\(_) _ \_ _|  
\__ \  | | |   /  / _ \   | |  | .` |/ _ \ | |\/| | _|\__ \    / _ \ |  _/| |   
|___/  |_| |_|_\ /_/ \_\  |_|  |_|\_/_/ \_\|_|  |_|___|___/   /_/ \_\|_| |___|  
"""

print(logo)

app.run(port=8080)
