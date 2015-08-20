import os
import json
import pandas as pd

def get_existing_procedures(dirpath='.'):

	procs = []
	for file in os.listdir(dirpath):
		if file[:4] == 'drg-':
			code = file.split('.')[0].split('-')[1]
			print("Processing {0:s}: {1:s}".format(file, code))
			with open(os.path.join(dirpath, file), 'r') as f:
				j = json.load(f)
				procs.append((code, j['name']))

	return procs

def dump_inpatient_jsons():

	IP = pd.read_csv('Medicare_Provider_Charge_Inpatient_DRG100_FY2013.csv')
	drg = list(IP['DRG Definition'].unique())
	drg = drg[:100]  #  remove NaN in the end.
	drg = [tuple(d.split(' - ')) for d in drg]

	# Fetch Averages
	av_map = avg_mapping()

	# Get specifics
	for code, name in drg:
		out = {}
		CF = IP[IP['DRG Definition'] == code + ' - ' + name]
		charges = []
		print("Processing {0:s}: {1:s}".format(code, name))
		for item in CF.iterrows():
			charges.append({"hospital": str(int(item[1]['Provider Id'])),
						"medicare": round(100.0 * item[1]['Average Total Payments']),
						"chargemaster": round(100.0 * item[1]['Average Covered Charges'])})
		out["charges"] = charges
		out["name"] = get_mapping().get(int(code), name)
		out["us_average"] = {"medicare": round(100.0 * av_map.get(code)[0]),
						     "chargemaster": round(100.0 * av_map.get(code)[1])}
		with open('drg-'+code.lstrip('0')+'.json','w') as f:
			f.write(json.dumps(out))

def avg_mapping():
	# Get  averages
	AV = pd.read_csv('Medicare_Charge_Inpatient_DRG100_DRG_Summary_by_DRG_FY2013.csv')
	av_map = {}
	for avg in AV.iterrows():
		av_map[avg[1]['DRG Definition'].split(' - ')[0]] = (avg[1]['Average Total Payments'],
														    avg[1]['Average Covered Charges'])

	return av_map

def utils():
	for item in drg:
		new_map[item[0].lstrip('0')] = old_map.get(item[0].lstrip('0'), "NOT FOUND IN 2011")

def get_mapping(): # Built manually by comparing 2011 output and 2013 inputs.
	return({
	252: 'Other vascular procedures with major complications',
	191: 'COPD (with complications)',
	638: 'Diabetes (with complications)',
	192: 'COPD',
	244: 'Pacemaker Implant',
	202: 'Bronchitis/Asthma (with complications)',
	853: 'Parasitic Disease',
	286: 'Other heart conditions (with major complications)',
	57: 'Degenerative nervous system disorders',
	330: 'Major small & large bowel procedures (with complications)',
	690: 'Urinary Tract Infection',
	329: 'Major small & large bowel procedures (with major complications)',
	193: 'Pneumonia (with major complications)',
	394: 'Other digestive system diagnoses',
	563: 'Other joint injuries',
	699: 'Other diagnoses (with complications)',
	689: 'Urinary Tract Infection (with major complications)',
	469: 'Joint replacement (with major complications)',
	39: 'Extracranial procedures',
	64: 'Stroke (with major complications)',
	309: 'Arrhythmia (with complications)',
	280: 'Heart Attack (with major complications)',
	238: 'Major cardiovascular procedures without major complications',
	640: 'Other nutritional conditions (with major complications)',
	254: 'Other vascular procedures',
	305: 'Hypertension',
	480: 'Hip & femur procedures (with major complications)',
	176: 'Pulmonary embolism',
	315: 'Other circulatory diagnoses (with complications)',
	287: 'Other heart conditions',
	372: 'Major gastrointestinal disorders (with complications)',
	698: 'Other diagnoses (with major complications)',
	65: 'Stroke (with complications)',
	312: 'Syncope',
	684: 'Kidney failure',
	74: 'Cranial & peripheral nerve disorders',
	194: 'Pneumonia (with complications)',
	177: 'Respiratory infection (with major complications',
	308: 'Arrhythmia (with major complications)',
	682: 'Kidney failure (with major complications)',
	195: 'Pneumonia',
	377: 'Gastrointestinal bleeding (with major complications)',
	292: 'Heart failure (with complications)',
	872: 'Sepsis',
	251: 'Perc cardiovasc procedures without coronary artery stent without major complications',
	379: 'Gastrointestinal bleeding',
	885: 'Psychosis',
	281: 'Heart attack (with complications)',
	918: 'Poisoning',
	314: 'Other circulatory diagnoses (with major complications)',
	439: 'Pancreatic disorders',
	871: 'Sepsis (with major complications)',
	189: 'Respiratory failure',
	246: 'Perc cardiovasc procedures with drug-eluting stent with major complications or 4+ vessels/stents',
	870: 'Sepsis (with mechanical ventilation)',
	602: 'Cellulitis (with major complications)',
	69: 'Ischemia',
	897: 'Substance Abuse',
	603: 'Cellulitis',
	313: 'Chest Pain',
	247: 'Perc cardiovasc procedures with drug-eluting stent without major complications',
	310: 'Arrhythmia',
	641: 'Other nutritional conditions',
	303: 'Atherosclerosis',
	390: 'Intestinal obstruction',
	243: 'Pacemaker implant (with complications)',
	552: 'Back pain',
	482: 'Hip & femur procedures',
	253: 'Other vascular procedures with complications',
	948: 'Pain control and abnormal findings',
	293: 'Heart failure',
	491: 'Back & neck procedures',
	536: 'Hip fracture',
	207: 'Respiratory system diagnosis with ventilator support 96+ hours',
	460: 'Spinal fusion',
	391: 'Esophagitis, gastroenteritis, and other digestive disorders (with major complications)',
	282: 'Heart attack',
	418: 'Removal of the gall bladder (with complications)',
	683: 'Kidney failure (with complications)',
	300: 'Peripheral vascular disease (with complications)',
	812: 'Blood disorder',
	378: 'Gastrointestinal bleeding (with complications)',
	178: 'Respiratory infection (with complications)',
	389: 'Intestinal obstruction (with complications)',
	208: 'Respiratory system diagnosis with ventilator support <96 hours',
	190: 'COPD (with major complications)',
	811: 'Blood disorder (with major complications)',
	66: 'Stroke',
	473: 'Cervical spinal fusion',
	470: 'Joint replacement',
	101: 'Seizure',
	392: 'Esophagitis, gastroenteritis, and other digestive disorders',
	481: 'Hip & femur procedures (with complications)',
	291: 'Heart failure (with major complications)',
	917: 'Poisoning (with major complications)',
	331: 'Major small & large bowel procedures without complications/major complications',
	484: 'Major joint & limb reattachment proc of upper extremity without complications,major complications',
	637: 'Diabetes (with major complications)',
	100: 'Seizures (with major complications)',
	467: 'Revision of hip or knee replacement (with complications)',})
