from flask import Flask, abort, jsonify, request, render_template
from pprint import pprint
from phonosynthesis import ipa_data
from phonosynthesis import phonosynth

# ERSP: Additional Imported Python Modules
from urllib.request import urlopen as uReq	
from bs4 import BeautifulSoup as soup	
import json 

app = Flask(__name__, static_url_path='')
app.config.from_envvar('PHONOSYNTHESIS_CONFIG')

@app.route('/')
def handle_homepage():
  # ERSP: Angela's Web scrapper for dataset files 
  datadict = {}	
  url = 'https://github.com/shraddhabarke/Phonosynthesis/tree/master/datasets'
  uClient = uReq(url)	
  html = uClient.read()	
  uClient.close()	
  page_soup = soup(html, "html.parser")	
  containers = page_soup.findAll("tr",{"class":"js-navigation-item"})	
  del containers[0]	
  for container in containers:	
    datadict.update({container.a["title"]:container.a["href"]}) 	
  return render_template('index.html', datalist = datadict)	
   
@app.route('/api/infer_rule', methods=['POST'])
def handle_infer_rule():
  if not request.json or not 'wordStems' in request.json:
    abort(400)

  words = []
  for stem in request.json['wordStems']:
    words.append((stem['underlyingForm'], stem['realization']))
    
  # ERSP Test: Identify and Write Feature Vector (If any) to TXT file
  g = open("inferred_rule.txt", "w") 
  g.write("Begin - inferred_rule(words)\n")
  # print("Begin - infer_rule(words)\n")
  abc = infer_rule(words)
  if not abc:
    g.write("List is empty\n")
  else:
    g.write("List is NOT empty\n")
    g.write(abc[0]+"\n")
    # print pprint(abc)
  g.write("End - inferred_rule(words)\n")
  # print("End - infer_rule(words)\n")
  g.close()

  # ERSP Test: Concate unsatisfiable-constraints to inferred_rule
  fin = open("unsatisfiable-constraints.txt", "r")
  data2 = fin.read()
  fin.close()
  fout = open("inferred_rule.txt", "a")
  fout.write("\n")
  print("fin data")
  print(data2)
  print("fin data end")
  fout.write(data2)
  fout.close()

  data2 = []
  with open('unsatisfiable-constraints.txt') as f:
    for line in f:
      data2.append(line)
  
  # print("test array")
  # print(data2[0])
  
  abc.extend(data2)
  print("test abc")
  print(abc[0])
  # print(abc[1]) 



  return jsonify(abc)

def format_features(features):
  matching_letter = ipa_data.get_matching_letter(features)
  if matching_letter:
    return matching_letter
  elif len(features) == 0:
    return None
  else:
    return [{'feature': feature, 'value': value} for feature, value in features.items()]

def infer_rule(words):
  data = phonosynth.parse(words)
  change = phonosynth.infer_change(data)
  rules = phonosynth.infer_rule(data, change)
  response = []
  for rule in rules:
    if rule:
      change, (left, target, right) = rule
      response.append(ipa_data.format_rule(target, {'left': left, 'right': right}, change))
  return response
