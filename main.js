
const versionNum = "1.0.5 beta";
const localName = "simpleTask";
const timeAlert = 300000; // 5 min
const zeroPad = (num, places) => String(num).padStart(places, "0");

const tasksObj = {
	"waiting": [],
	"inProgress": [],
	"toCheck": [],
	"completed": [],
	"archival": [],
	"note": {
		"crDate": null,
		"upDate": null,
		"text": null
	},
	"category": [],
	"settings": {
		"category": null
	}
};

const columnsName = [
	{
		"name": "waiting",
		"cName": "tasksWaiting"
	},
	{
		"name": "inProgress",
		"cName": "tasksInProgress"
	},
	{
		"name": "toCheck",
		"cName": "tasksToCheck"
	},
	{
		"name": "completed",
		"cName": "tasksCompleted"
	},
	{
		"name": "archival",
		"cName": ""
	}
];

const columnIdToName = {};
columnIdToName[columnsName[0]["cName"]] = columnsName[0]["name"];
columnIdToName[columnsName[1]["cName"]] = columnsName[1]["name"];
columnIdToName[columnsName[2]["cName"]] = columnsName[2]["name"];
columnIdToName[columnsName[3]["cName"]] = columnsName[3]["name"];

const categoryItems = [
	{
		'value': "",
		'name': 'Wbierz...',
		'color': null,
		'position': 0
	},
	{
		'value': 'other',
		'name': 'Inne',
		'color': null,
		'position': null
	}
];

tasksObj.category = categoryItems;


if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1" && location.protocol !== 'https:') {
	location.replace(`https:${location.href.substring(location.protocol.length)}`);
}


document.addEventListener('DOMContentLoaded',function() { // waiting for document
	
	document.getElementById("version-text").innerText = "version: " + versionNum;
	
	// check for notification
	if ("Notification" in window && Notification.permission !== "denied" && Notification.permission !== "granted") {
		alertNew({message: "Do poprawnego wyświetlania powiadomień, w przypadku gdy przeglądarka internetowa będzie nie aktywna (zminimalizowana) lub będzie otwarta inna karta w przeglądarce wymagane jest udzielenie uprawnień do wyświetlania powiadomień.", style: "", title: "Notyfikacje", buttonSubmit: "Potwierdź", radius: true, fnCallback: function(){
			Notification.requestPermission();
		}});
	}
	
	// load data
	if (typeof Storage !== "undefined") {
		if (window.localStorage.getItem(localName) != null && window.localStorage.getItem(localName) != '') {
			let tasksObjTmp = JSON.parse(window.localStorage.getItem(localName));
			
			tasksObj.waiting = tasksObjTmp.waiting;
			tasksObj.inProgress = tasksObjTmp.inProgress;
			tasksObj.toCheck = tasksObjTmp.toCheck;
			tasksObj.completed = tasksObjTmp.completed;
			tasksObj.archival = tasksObjTmp.archival;
			tasksObj.note = tasksObjTmp.note;
			tasksObj.category = tasksObjTmp.category;
			tasksObj.settings = tasksObjTmp.settings;
			
			delete tasksObjTmp;
		}
		
		showTasks(tasksObj);
	}
	
	generateCategorySelect(tasksObj.category); // creating category select list
	
	dtPicker({
		"format": "Y-m-d H:i",
		"selector": "#expiration_date", // selector on click
		"type": "onclick", // onclick / inline
		"id": "dtFrame"
	});
	
	dtPicker({
		"format": "Y-m-d H:i",
		"selector": "#start_date", // selector on click
		"type": "onclick", // onclick / inline
		"id": "dtFrame"
	});
	
	document.getElementById("startDateSet").addEventListener("change", (ev) => {
		if (ev.target.checked == true) {
			document.getElementById("start_date").parentNode.classList.remove("hidden");
		}
		else {
			document.getElementById("start_date").parentNode.classList.add("hidden");
		}
	});
	
	// create new task
	document.getElementById("taskNew").addEventListener("submit", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		
		const fd = new FormData(ev.target);
		const formValues = Array.from(fd.entries()).reduce((acc, cv) => ({...acc, [cv[0]]: cv[1]}), {});
		
		let dateObj = new Date();
		let nextId = dateObj.getTime();
		
		const newObj = {
			"id": nextId,
			"crDate": dateObj.getFullYear() + "-" + zeroPad(dateObj.getMonth() + 1, 2) + "-" + zeroPad(dateObj.getDate(), 2) + " " + zeroPad(dateObj.getHours(), 2) + ":" + zeroPad(dateObj.getMinutes(), 2) + ":" + zeroPad(dateObj.getSeconds(), 2),
			"getDate": null,
			"upDate": null,
			"expDate": null,
			"expDateInt": null,
			"lastStatus": null,
			"priority": null,
			"alertStatus": 0, // 0 - nie wyświetlone powiadomienie, 1 - wyświetlone o zbliżającym się czasie do końca, 2 - wyświetlone o przedawnieniu
			"title": null,
			"content": null,
			"contentType": 0, // 0 - text, 1 - html
			"category": null
		};
		
		if (formValues.newTitle !== undefined && formValues.newTitle !== null) {
			newObj.title = formValues.newTitle;
		}
		
		if (formValues.newContent !== undefined && formValues.newContent !== null) {
			newObj.content = formValues.newContent;
		}
		
		if (formValues.taskPriority !== undefined && formValues.taskPriority !== null) {
			newObj.priority = formValues.taskPriority;
		}
		
		if (formValues.newCategory !== undefined && formValues.newCategory !== null) {
			newObj.category = formValues.newCategory;
		}
		
		if (formValues.expiration_date !== undefined && formValues.expiration_date !== null) {
			const expDate = formValues.expiration_date;
			newObj.expDate = expDate + ":00";
			newObj.expDateInt = new Date(expDate.slice(0, 4), expDate.slice(5, 7) - 1, expDate.slice(8, 10), expDate.slice(11, 13), expDate.slice(14, 16), "00").getTime();
		}
		
		if (newObj.content !== null && newObj.expDateInt > 0) {
			tasksObj.waiting.push(newObj);
			delete newObj;
			
			if (typeof(Storage) !== "undefined") {
				window.localStorage.setItem(localName, JSON.stringify(tasksObj));
			}
			
			ev.target.reset();
			showTasks(tasksObj);
		}
		else {
			// error add task
		}
		
		return false;
	});
	
	
	// send message
	document.getElementById("contactForm").addEventListener("submit", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		
		let dataF = new FormData();
		dataF.append("name", ev.target.children.firstname.value);
		dataF.append("email", ev.target.children.email.value);
		dataF.append("message", ev.target.children.message.value);
		
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "a.php");
		xhr.onload = function(){
			if (this.response == 1) {
				ev.target.reset();
				alert("Poprawnie wysłano wiadomość.");
			}
			else {
				alert("Wiadomość nie została wysłana.");
			}
		};
		xhr.send(dataF);
		
		delete xhr; delete dataF;
		
		return false;
	});
	
	
	// download data
	let buttonDownload = document.querySelector(".dataDownload");
	buttonDownload.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("showDetails").classList.add("infoShow");
		document.getElementById("showDetails").innerHTML = "";
		
		let textArea = document.createElement("textarea");
		textArea.id = "dataDownloadJSON";
		textArea.classList.add("saveText");
		
		let tasksBaseTmp = btoa(unescape(encodeURIComponent(JSON.stringify(tasksObj))));
		
		//downloadData("ZadaniaDoWykonania_pl.txt", tasksBaseTmp);
		textArea.innerHTML = tasksBaseTmp;
		
		document.getElementById("showDetails").appendChild(textArea);
		
		delete tasksBaseTmp;
	};
	
	// upload data
	let buttonUpload = document.querySelector(".dataUpload");
	buttonUpload.onclick = function(){
		
		let textArea = document.getElementById("dataUploadJSON");
		
		if (textArea != null && textArea != "") {
			
			let tasksObjTmp = JSON.parse(decodeURIComponent(escape(atob(textArea.value))));
			
			if (typeof(Storage) !== "undefined") {
				window.localStorage.setItem(localName, JSON.stringify(tasksObjTmp));
			}
			
			tasksObj.waiting = tasksObjTmp.waiting;
			tasksObj.inProgress = tasksObjTmp.inProgress;
			tasksObj.toCheck = tasksObjTmp.toCheck;
			tasksObj.completed = tasksObjTmp.completed;
			tasksObj.archival = tasksObjTmp.archival;
			tasksObj.note = tasksObjTmp.note;
			tasksObj.settings = tasksObjTmp.settings;
			tasksObj.category = tasksObjTmp.category;
			
			delete tasksObjTmp;
			
			generateCategorySelect(tasksObj.category);
			showTasks(tasksObj);
			document.getElementById("showDetails").innerHTML = "";
		}
		else
		{
			// create textarea for upload data in base64
			classNameRemove(".infoArea", "infoShow");
			document.getElementById("showDetails").classList.add("infoShow");
			document.getElementById("showDetails").innerHTML = "";
			let textArea = document.createElement("textarea");
			textArea.id = "dataUploadJSON";
			textArea.classList.add("saveText");
			document.getElementById("showDetails").appendChild(textArea);
		}
	};
	
	// clear data
	let buttonDelete = document.querySelector(".dataDelete");
	buttonDelete.onclick = function(){
		alertNew({message: "Czy napewno chcesz usunąć wszyskie dane?", style: "error", title: "Usuwanie", buttonSubmit: "Potwierdź", radius: true, fnCallback: function(){
			if (typeof(Storage) !== "undefined") {
				window.localStorage.clear();
			}
			
			tasksObj.waiting = [];
			tasksObj.inProgress = [];
			tasksObj.toCheck = [];
			tasksObj.completed = [];
			tasksObj.archival = [];
			tasksObj.note = {
				"crDate": null,
				"upDate": null,
				"text": null
			};
			tasksObj.settings = {};
			
			tasksObj.category = [];
			tasksObj.category = categoryItems;
			
			generateCategorySelect(tasksObj.category);
			showTasks(tasksObj);
		}});
	}
	
	// help
	let buttonHelp = document.querySelector(".getHelp");
	buttonHelp.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("helpInfo").classList.add("infoShow");
	};
	
	// cookies info
	let buttonCookiesInfo = document.querySelector(".getCookiesInfo");
	buttonCookiesInfo.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("cookiesInfo").classList.add("infoShow");
	};
	
	document.querySelector(".getContact").onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("contactInfo").classList.add("infoShow");
	};
	
	// notes
	let buttonNote = document.querySelector(".editNote");
	buttonNote.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("showDetails").classList.add("infoShow");
		document.getElementById('showDetails').innerHTML = "";
		
		let noteTitle = document.createElement("div");
		noteTitle.innerText = "Notatnik";
		let textArea = document.createElement("textarea");
		textArea.id = "editNoteText";
		textArea.classList.add("saveText");
		
		if (tasksObj.note.text != null) {
			textArea.innerHTML = tasksObj.note.text;
		}
		
		let btnSave = document.createElement("button");
		btnSave.innerText = "Zapisz";
		btnSave.onclick = function(){
			
			let dateObj = new Date();
			
			if (tasksObj.note.crDate == null) {
				tasksObj.note.crDate = dateObj.getFullYear() + "-" + zeroPad(dateObj.getMonth() + 1, 2) + "-" + zeroPad(dateObj.getDate(), 2) + " " + zeroPad(dateObj.getHours(), 2) + ":" + zeroPad(dateObj.getMinutes(), 2) + ":" + zeroPad(dateObj.getSeconds(), 2);
			}
			
			tasksObj.note.upDate = dateObj.getFullYear() + "-" + zeroPad(dateObj.getMonth() + 1, 2) + "-" + zeroPad(dateObj.getDate(), 2) + " " + zeroPad(dateObj.getHours(), 2) + ":" + zeroPad(dateObj.getMinutes(), 2) + ":" + zeroPad(dateObj.getSeconds(), 2);
			
			if (typeof(Storage) !== "undefined") {
				window.localStorage.setItem(localName, JSON.stringify(tasksObj));
			}
			
			tasksObj.note.text = document.getElementById("editNoteText").value;
			
			delete dateObj;
		};
		
		document.getElementById('showDetails').appendChild(noteTitle);
		document.getElementById('showDetails').appendChild(textArea);
		document.getElementById('showDetails').appendChild(btnSave);
	};
	
	
	// Settings
	let buttonSettings = document.querySelector(".editSettings");
	buttonSettings.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("settingsArea").innerHTML = "";
		document.getElementById("settingsArea").classList.add("infoShow");
		
		createSelectCategory();
	};
	
	// ToDo list
	let buttonToDo = document.querySelector(".editToDo");
	buttonToDo.onclick = function(){
		classNameRemove(".infoArea", "infoShow");
		document.getElementById("showDetails").classList.add("infoShow");
		document.getElementById('showDetails').innerHTML = "";
		
		let inputTodo = fnCreate({"tag": "input", "class": ["testowa", "inna"]});
		
		document.getElementById('showDetails').appendChild(inputTodo);
	};
	
	// drag and drop
	let draggableList = document.getElementsByClassName("tasksList");
	
	for (let i = 0; i < draggableList.length; i++) {
		draggableList[i].addEventListener("dragenter", function () {
			draggableList[i].classList.add("over");
		});
		
		draggableList[i].addEventListener("dragleave", function () {
			draggableList[i].classList.remove("over");
		});
		
		draggableList[i].addEventListener("dragover", function (evt) {
			evt.preventDefault();
		});
		
		draggableList[i].addEventListener("drop", function (evt) {
			evt.preventDefault();
			
			let itemMove = document.getElementsByClassName("itemMove")[0];
			
			let parentFrom_id = itemMove.parentNode.parentNode.id;
			let parentTo_id = evt.currentTarget.parentNode.id;
			
			if (parentFrom_id != parentTo_id) { // evt.target != itemMove.parentNode && evt.target != itemMove
				
				let itemMove_id = itemMove.id.slice(4);
				
				if (tasksObj[columnIdToName[parentFrom_id]].length > 0) {
					for (let o = 0; o < tasksObj[columnIdToName[parentFrom_id]].length; o++) {
						if (tasksObj[columnIdToName[parentFrom_id]][o].id = itemMove_id) {
							
							let dateObj = new Date();
							tasksObj[columnIdToName[parentFrom_id]][o].upDate = dateObj.getFullYear() + "-" + zeroPad(dateObj.getMonth() + 1, 2) + "-" + zeroPad(dateObj.getDate(), 2) + " " + zeroPad(dateObj.getHours(), 2) + ":" + zeroPad(dateObj.getMinutes(), 2) + ":" + zeroPad(dateObj.getSeconds(), 2);
							
							tasksObj[columnIdToName[parentTo_id]].push(tasksObj[columnIdToName[parentFrom_id]][o]);
							tasksObj[columnIdToName[parentFrom_id]].splice(o, 1);
							
							if (columnIdToName[parentTo_id] == "completed") {
								document.getElementById(itemMove.id).classList.remove("blinkAlert");
							}
							
							if (typeof(Storage) !== "undefined") {
								window.localStorage.setItem(localName, JSON.stringify(tasksObj));
							}
							
							break;
						}
					}
				}
				
				itemMove.parentNode.removeChild(itemMove);
				evt.target.appendChild(itemMove);
			}
			
			draggableList[i].classList.remove("over");
		});
	}
	
	
	// check status tasks
	loopNoEnd(function(){
		let dateNow = new Date();
		let dateNowInt = dateNow.getTime();
		
		for (let pKey in tasksObj) {
			const tObj = tasksObj[pKey];
			
			if ((pKey == "waiting" || pKey == "inProgress" || pKey == "toCheck") && tObj.length > 0) {
				tObj.forEach(function(tItem) {
					if (tItem.alertStatus == 0 && tItem.expDateInt <= (dateNowInt + timeAlert)) {
						if (!document.getElementById("task" + tItem.id).classList.contains("blinkAlert")) {
							document.getElementById("task" + tItem.id).classList.add("blinkAlert");
						}
						notifyPush("Zadanie: " + tItem.title, "Twoje zadanie dobiega końca.");
						tItem.alertStatus = 1;
					}
					else if (tItem.alertStatus == 1 && tItem.expDateInt <= dateNowInt) {
						if (!document.getElementById("task" + tItem.id).classList.contains("blinkAlert")) {
							document.getElementById("task" + tItem.id).classList.add("blinkAlert");
						}
						notifyPush("Zadanie: " + tItem.title, "Upłynął czas na wykonanie zadania.");
						tItem.alertStatus = 2;
					}
				});
			}
			
			delete tObj;
		}
		
		delete dateNow;
		delete dateNowInt;
	});
});




// never end loop
async function loopNoEnd (actionFn) {
	for (;;) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		actionFn();
	}
	
}


// notification
function notifyPush (nTitle, nBody, nImage) {
	
	// icon: data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
	
	if ("Notification" in window) {
		if (Notification.permission === "granted") {
			let notification = new Notification(nTitle, {"body": nBody, "icon": nImage});
		}
		else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(function (permission) {
				if (permission === "granted") {
					let notification = new Notification(nTitle, {"body": nBody, "icon": nImage});
				}
			});
		}
	}
}


function fnCreate (eObj) {
	let element = null;
	
	if (eObj !== null && eObj !== undefined && typeof eObj == "string" && eObj != "") {
		element = document.createElement(eObj);
	}
	else if (eObj !== null && eObj !== undefined && typeof eObj == "object" && eObj.tag !== null && eObj.tag !== undefined && eObj.tag != "") {
		element = document.createElement(eObj.tag);
		
		if (eObj.class !== undefined && eObj.class !== null) {
			element.classList.add(...eObj.class);
		}
		
	}
	
	return element;
}


// show tasks from object
function showTasks (tObj) {
	
	let tasksListZones = document.getElementsByClassName("tasksList");
	
	for (let i = 0; i < columnsName.length; i++) {
		if (columnsName[i]["cName"] != "") {
			let tasksList = document.getElementById(columnsName[i]["cName"]).getElementsByClassName("tasksList")[0];
			tasksList.innerHTML = '';
			
			let tObjTmp = tObj[columnsName[i]["name"]];
			
			if (tObjTmp.length > 0) {
				
				for (let j = 0; j < tObjTmp.length; j++) {
					let categoryName = 'N/A';
					
					if (tasksObj.category.length > 0) {
						tasksObj.category.forEach(function(item) {
							if (tObjTmp[j].category == item['value']) {
								categoryName = item['name'];
							}
						});
					}
					
					
					let taskItem = document.createElement("div");
					taskItem.classList.add("taskItem");
					taskItem.id = "task" + tObjTmp[j].id;
					
					let taskItem_header = document.createElement("div");
					taskItem_header.classList.add("taskItem-header");
					let taskItem_title = document.createElement("h5");
					let taskItem_title_text = document.createTextNode(tObjTmp[j].title);
					taskItem_title.appendChild(taskItem_title_text);
					let taskItem_priority = document.createElement("span");
					taskItem_priority.classList.add("taskPriority" + tObjTmp[j].priority);
					// taskItem_priority.title = "title category";
					let taskItem_projekt = document.createElement("h6");
					let taskItem_header_dates = document.createElement("div");
					taskItem_header_dates.classList.add("taskItem-header_dates");
					taskItem_projekt.innerText = categoryName;
					let crDate = document.createElement("span");
					crDate.innerText = tObjTmp[j].crDate;
					let expDate = document.createElement("span");
					expDate.innerText = tObjTmp[j].expDate;
					taskItem_projekt.appendChild(taskItem_priority);
					taskItem_header.appendChild(taskItem_projekt);
					taskItem_header.appendChild(taskItem_title);
					taskItem_header_dates.appendChild(crDate);
					taskItem_header_dates.appendChild(expDate);
					taskItem_header.appendChild(taskItem_header_dates);
					let taskItem_body = document.createElement("div");
					taskItem_body.classList.add("taskItem-body");
					let taskItem_body_text = document.createElement("div");
					if (tObjTmp[j].contentType == 1) {
						taskItem_body_text.innerHTML = tObjTmp[j].content;
					}
					else {
						taskItem_body_text.innerHTML = "<p>" + tObjTmp[j].content + "</p>";
					}
					taskItem_body.appendChild(taskItem_body_text);
					
					let taskItem_buttons = document.createElement("div");
					taskItem_buttons.classList.add("taskItem-buttons");
					let taskItem_buttons_delete = document.createElement("button");
					taskItem_buttons_delete.innerText = "Usuń";
					taskItem_buttons_delete.addEventListener("click", function(ev){
						let delId = ev.target.parentNode.parentNode.id.slice(4);
						
						for (let pKey in tasksObj) {
							const tObj = tasksObj[pKey];
							
							if ((pKey == "waiting" || pKey == "inProgress" || pKey == "toCheck") && tObj.length > 0) {
								for (let o = 0; o < tObj.length; o++) {
									tasksObj[pKey].splice(o, 1);
									
									if (typeof(Storage) !== "undefined") {
										window.localStorage.setItem(localName, JSON.stringify(tasksObj));
									}
									
									showTasks(tasksObj);
									break;
								}
							}
						}
					});
					taskItem_buttons.appendChild(taskItem_buttons_delete);
					//let taskItem_buttons_archive = document.createElement("button");
					//taskItem_buttons_archive.innerText = "Archiwizuj";
					//taskItem_buttons.appendChild(taskItem_buttons_archive);
					
					taskItem.appendChild(taskItem_header);
					taskItem.appendChild(taskItem_body);
					taskItem.appendChild(taskItem_buttons);
					
					taskItem.addEventListener("dragstart", function(ev){
						taskItem.classList.add("itemMove");
					}, false);
					
					taskItem.addEventListener("dragend", function(ev){
						taskItem.classList.remove("itemMove");
					}, false);
					
					taskItem.addEventListener("drag", function(ev){
						// run
					}, false);
					
					taskItem.setAttribute("draggable", "true");
					
					tasksList.appendChild(taskItem);
				}
			}
			
			
			
		}
	}
	
	
}


function downloadData (filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function classNameRemove (selector, className) {
	[].forEach.call(document.querySelectorAll(selector), function(s){
		s.classList.remove(className);
	});
}







// generate category select list
function generateCategorySelect (cItems) {
	
	if (typeof cItems == "undefined") {
		return null;
	}
	
	let select = document.createElement("select");
	select.name = "newCategory";
	
	cItems.forEach(function(item) {
		let option = document.createElement("option");
		option.value = item["value"];
		option.textContent = item["name"];
		select.appendChild(option);
	});
	
	/*
	
	{
				"class": null, // css classes, string
				"type": "text" // area, text, select, checkbox, radio
				"name": "",
				"label": "",
				"placeholder": "",
				"required": false,
				"checked": false // for checkbox, radio
			}
	
	*/
	
	
	let categoryNew = document.createElement("button");
	categoryNew.innerText = "+";
	categoryNew.onclick = function(){
		alertNew({
			title: "Nowa kategoria",
			message: "Dodawanie nowej kategorii zadań.",
			buttonSubmit: "Dodaj",
			radius: true,
			inputs: [
				{type: "text", name: "categoryName", id: "categoryNameAlertNew", placeholder: "Podaj nazwę kategorii"}
			],
			fnSubmit: function(cb){
				let cName = document.getElementById("categoryNameAlertNew").value;
				
				tasksObj.category.push({
					'value': cName,
					'name': cName,
					'color': null,
					'position': null
				});
				
				select.innerHTML = "";
				
				// tasksObj.category.forEach(function(item) {
				// 	let option = document.createElement("option");
				// 	option.value = item["value"];
				// 	option.textContent = item["name"];
				// 	select.appendChild(option);
				// });
				
				generateCategorySelect(tasksObj.category);
				
				createSelectCategory();
				
				if (typeof(Storage) !== "undefined") {
					window.localStorage.setItem(localName, JSON.stringify(tasksObj));
				}
			}
		});
	};
	
	document.getElementById("categorySelect").innerHTML = "";
	document.getElementById("categorySelect").appendChild(select);
	document.getElementById("categorySelect").appendChild(categoryNew);
}


// reset value of element
function resetValue (nodeObj) {
	
	if (nodeObj != null && nodeObj.length > 0) {
		
		for (let i = 0; i < nodeObj.length; i++) {
			if (nodeObj[i].type == "checkbox" || nodeObj[i].type == "radio") {
				nodeObj[i].checked = false;
			}
			else if (nodeObj[i].type == "text") {
				nodeObj[i].value = "";
			}
			else if (nodeObj[i].type == "select-one") {
				nodeObj[i].value = null;
				//nodeObj[i].reset();
			}
			else if (nodeObj[i].type == "textarea") {
				nodeObj[i].value = "";
			}
		}
	}
}


function createSelectCategory () {
	let settingsAreaBox;
	
	if (document.getElementById("settingsArea").classList.contains("infoShow")) {
		
		if (document.getElementById("settingsArea-box") == null) {
			settingsAreaBox = document.createElement("div");
			settingsAreaBox.id = "settingsArea-box";
		}
		else {
			settingsAreaBox = document.getElementById("settingsArea-box");
			settingsAreaBox.innerHTML = "";
		}
		
		let selectCategory = document.createElement("select");
		
		let selectCategoryTitile = document.createElement("h3");
		selectCategoryTitile.innerText = "Wybierz kategorię";
		
		if (tasksObj.category.length > 0) {
			tasksObj.category.forEach(function(item) {
				let option = document.createElement("option");
				option.value = item["value"];
				option.textContent = item["name"];
				
				if (tasksObj.settings.category == item["value"]) {
					option.selected = true;
				}
				
				selectCategory.appendChild(option);
			});
		}
		
		selectCategory.addEventListener("change", function() {
			tasksObj.settings.category = this.value;
			showSelectCategory();
		});
		
		settingsAreaBox.appendChild(selectCategoryTitile);
		settingsAreaBox.appendChild(selectCategory);
		document.getElementById("settingsArea").appendChild(settingsAreaBox);
	}
}


function showSelectCategory () {
	document.querySelectorAll("#tasksTable .tasksList .taskItem").forEach(function(e) {
		e.classList.remove("taskItem-hidden");
	});
	
	console.log(tasksObj.settings.category);
	
	if (tasksObj.settings.category != "") {
		for (let pKey in tasksObj) {
			const tObj = tasksObj[pKey];
			
			if ((pKey == "waiting" || pKey == "inProgress" || pKey == "toCheck") && tObj.length > 0) {
				tObj.forEach(function(tItem) {
					if (tItem.category != tasksObj.settings.category) {
						document.getElementById("task" + tItem.id).classList.add("taskItem-hidden");
					}
				});
			}
		}
	}
}


function dtPicker (objDT) {
	
	let dateInt = Date.now();
	
	const confDT = {
		"format": "Y-m-d H:i", // "Y-m-d H:i:s"
		"dateSet": null,
		"selector": null, // selector on click
		"type": "onclick", // onclick / inline
		"id": "dtFrame",
		"class": "dtFrame",
		"debug": true
	};
	
	if (typeof objDT == "object") {
		if (objDT.selector != undefined) {
			confDT.selector = objDT.selector;
		}
	} // if default settings, add only selector
	else if (objDT != undefined && objDT != null) {
		confDT.selector = objDT;
	}
	else {
		return false;
	}
	
	let fnDebug = function (logText) {
		if (confDT.debug === true) {
			let callLine = (new Error).stack.split("\n")[1];
			let logLine = callLine.indexOf("main.js:");
			logLine = callLine.slice(logLine+8, callLine.length);
			
			console.log("%cLine: " + logLine + " | %c " + logText, "color: #54c030; font-size: 10px; background: #000000;", "color: #000000; font-size: 12px; background: #F5F5F5;");
		}
	}
	
	if (confDT.selector !== null) {
		
		document.querySelector(confDT.selector).onclick = function(ev){
			
			if (document.getElementById(confDT.id)) {
				return false;
			}
			
			
			let dateObj = new Date(dateInt);
			
			let sYear = dateObj.getFullYear();
			let sMonth = dateObj.getMonth();
			let sDayStart = new Date(sYear, sMonth, 0).getDay(); // day start
			let sDayEnd = new Date(sYear, sMonth, 0).getDate(); // number of days
			let sHour = dateObj.getHours();
			let sMinute = dateObj.getMinutes();
			let sSecond = dateObj.getSeconds();
			
			let sYearMove = 0;
			let sMonthMove = 0;
			
			let sHourMove = 0;
			let sMinuteMove = 0;
			let sSecondMove = 0;
			
			let setValue = "";
			
			const setValueObj = {
				"year": null,
				"month": null,
				"day": null,
				"hour": null,
				"minute": null,
				"second": null,
				
				"daySep": "-", // Separator
				"hourSep": ":",
				"dayHourSep": " ",
				
				"int": {
					"year": sYear,
					"month": sMonth,
					"day": null,
					"hour": null,
					"minute": null,
					"second": null
				}
			};
			
			if (this.value != null && this.value != "") {
				fnDebug("Obecna wartość: " + this.value);
				// console.log(this);
				setValue = this.value;
			}
			
			let fnSelect = function(){
				fnDebug("Wybrano: " + this.value + " type: " + this.dataset.dtType);
				
				if (this.dataset.dtType == "Y") {
					setValueObj.year = this.value;
					setValueObj.int.year = parseInt(this.value);
					
					sDayStart = new Date(setValueObj.int.year, setValueObj.int.month, 0).getDay();
					sDayEnd = new Date(setValueObj.int.year, setValueObj.int.month+1, 0).getDate();
					testFun(sDayStart, sDayEnd, "sDays", "sDay", "d", null, null, false);
				}
				else if (this.dataset.dtType == "m") {
					setValueObj.month = this.value;
					setValueObj.int.month = parseInt(this.value);
					
					sDayStart = new Date(setValueObj.int.year, setValueObj.int.month, 0).getDay();
					sDayEnd = new Date(setValueObj.int.year, setValueObj.int.month+1, 0).getDate();
					testFun(sDayStart, sDayEnd, "sDays", "sDay", "d", null, null, false);
				}
				else if (this.dataset.dtType == "d") {
					setValueObj.day = this.value;
					setValueObj.int.day = parseInt(this.value);
				}
				else if (this.dataset.dtType == "h") {
					setValueObj.hour = this.value;
					setValueObj.int.hour = parseInt(this.value);
				}
				else if (this.dataset.dtType == "i") {
					setValueObj.minute = this.value;
					setValueObj.int.minute = parseInt(this.value);
				}
				else if (this.dataset.dtType == "s") {
					setValueObj.second = this.value;
					setValueObj.int.second = parseInt(this.value);
				}
				
				setValue = "";
				
				if (setValueObj.year !== null) {
					setValue += setValueObj.year;
				}
				
				if (setValueObj.month !== null) {
					if (setValue != "") {
						setValue += setValueObj.daySep;
					}
					setValue += zeroPad(parseInt(setValueObj.month)+1, 2);
				}
				
				if (setValueObj.day !== null) {
					if (setValue != "") {
						setValue += setValueObj.daySep;
					}
					setValue += zeroPad(setValueObj.day, 2);
				}
				
				if (setValueObj.hour !== null) {
					if (setValue != "") {
						setValue += setValueObj.dayHourSep;
					}
					setValue += zeroPad(setValueObj.hour, 2);
				}
				
				if (setValueObj.minute !== null) {
					if (setValue != "") {
						setValue += setValueObj.hourSep;
					}
					setValue += zeroPad(setValueObj.minute, 2);
				}
				
				if (setValueObj.second !== null) {
					if (setValue != "") {
						setValue += setValueObj.hourSep;
					}
					setValue += zeroPad(setValueObj.second, 2);
				}
				
				if (setValue != "") {
					document.querySelector(confDT.selector).value = setValue;
				}
			};
			
			
			let mainFrame = document.createElement("div");
			mainFrame.id = confDT.id;
			mainFrame.classList.add(confDT.class);
			
			if (this.offsetWidth > 0) {
				mainFrame.style.width = this.offsetWidth + "px";
			}
			
			// dodać div z tytułem oraz na przyciski
			let dtHeader = document.createElement("div");
			dtHeader.classList.add("dtHeader");
			dtHeader.id = "dtHeader";
			
			let btnClose = document.createElement("button");
			btnClose.innerText = "X";
			btnClose.onclick = function(eb){
				this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
				return false;
			};
			
			dtHeader.appendChild(btnClose);
			mainFrame.appendChild(dtHeader);
			
			let testFun = function(from, to, where, name, dtType, prevOnclick, nextOnclick, showArrows) {
				
				const monthName = [
					{
						"normal": "Styczeń",
						"short": "Sty"
					},
					{
						"normal": "Luty",
						"short": "Lut"
					},
					{
						"normal": "Marzec",
						"short": "Mar"
					},
					{
						"normal": "Kwiecień",
						"short": "Kwi"
					},
					{
						"normal": "Maj",
						"short": "Maj"
					},
					{
						"normal": "Czerwiec",
						"short": "Cze"
					},
					{
						"normal": "Lipiec",
						"short": "Lip"
					},
					{
						"normal": "Sierpień",
						"short": "Sie"
					},
					{
						"normal": "Wrzesień",
						"short": "Wrz"
					},
					{
						"normal": "Październik",
						"short": "Paź"
					},
					{
						"normal": "Listopad",
						"short": "Lis"
					},
					{
						"normal": "Grudzień",
						"short": "Gru"
					}
				];
				
				const dayName = [
					{
						"normal": "Poniedziałek",
						"short": "Pn"
					},
					{
						"normal": "Wtorek",
						"short": "Wt"
					},
					{
						"normal": "Środa",
						"short": "Śr"
					},
					{
						"normal": "Czwartek",
						"short": "Cz"
					},
					{
						"normal": "Piątek",
						"short": "Pn"
					},
					{
						"normal": "Sobota",
						"short": "So"
					},
					{
						"normal": "Niedziela",
						"short": "Ni"
					}
				]; 
				
				let whereDom = document.getElementById(where);
				
				if (whereDom) {
					let end;
					while (end = whereDom.lastChild) whereDom.removeChild(end);
				}
				else {
					whereDom = document.createElement("div");
					whereDom.id = where;
					whereDom.classList.add("dtRow");
					
					if (dtType == "h") {
						mainFrame.children.dtHeader.after(whereDom);
					}
					else if (dtType == "i") {
						if (mainFrame.children.sHours) {
							mainFrame.children.sHours.after(whereDom);
						}
						else {
							mainFrame.children.dtHeader.after(whereDom);
						}
					}
					else if (dtType == "s") {
						if (mainFrame.children.sMinutes) {
							mainFrame.children.sMinutes.after(whereDom);
						}
						else if (mainFrame.children.sHours) {
							mainFrame.children.sHours.after(whereDom);
						}
						else {
							mainFrame.children.dtHeader.after(whereDom);
						}
					}
					else
					{
						mainFrame.appendChild(whereDom);
					}
					
				}
				
				if (showArrows == true) {
					let btnPrev = document.createElement("button");
					btnPrev.innerText = "<<";
					
					if (prevOnclick != null) {
						btnPrev.onclick = prevOnclick;
					}
					 
					whereDom.appendChild(btnPrev);
				}
				
				let weekRow;
				
				if (dtType == "d") {
					
					let ii = 0;
					
					weekRow = document.createElement("div");
					weekRow.classList.add("weekRow");
					whereDom.appendChild(weekRow);
					
					dayName.forEach(function(d){
						let labelDay = document.createElement("div");
						labelDay.classList.add("dtLabel-day");
						labelDay.innerText = d.short;
						weekRow.appendChild(labelDay);
					});
					
					for (let i = 1; i <= to; i++) {
						
						if (ii == 0 || ii == 7) {
							weekRow = document.createElement("div");
							weekRow.classList.add("weekRow");
							whereDom.appendChild(weekRow);
							
							ii = 0;
							
							if (i == 1) {
								ii = from;
								
								for (let iii = 0; iii < from; iii++) {
									let inputLabel = document.createElement("label");
									inputLabel.classList.add("dtLabel-empty");
									inputLabel.innerText = "-";
									
									weekRow.appendChild(inputLabel);
								}
							}
						}
						
						let input = document.createElement("input");
						input.type = "radio";
						input.id = name + i;
						input.dataset.dtType = dtType;
						
						let inputLabel = document.createElement("label");
						inputLabel.classList.add("dtLabel");
						inputLabel.htmlFor = input.id;
						inputLabel.innerText = i;
						
						
						input.onclick = fnSelect;
						
						input.name = name;
						input.value = i;
						
						weekRow.appendChild(input);
						weekRow.appendChild(inputLabel);
						
						ii++;
					}
				}
				else if (dtType == "h" || dtType == "i" || dtType == "s") {
					whereDom.classList.add("dtTime");
					let input = document.createElement("input");
					input.type = "text";
					input.id = name;
					input.dataset.dtType = dtType;
					
					let inputLabel = document.createElement("label");
					inputLabel.classList.add("dtLabel");
					inputLabel.htmlFor = input.id;
					inputLabel.innerText = from;
					
					input.onclick = fnSelect;
					
					input.name = name;
					input.value = from;
					
					whereDom.appendChild(input);
					whereDom.appendChild(inputLabel);
				}
				else {
					let im = null;
					for (let i = from; i <= to; i++) {
						
						let input = document.createElement("input");
						input.type = "radio";
						// input.id = name + i;
						input.dataset.dtType = dtType;
						
						let inputLabel = document.createElement("label");
						inputLabel.classList.add("dtLabel");
						// inputLabel.htmlFor = input.id;
						// inputLabel.innerText = i;
						
						if (dtType == "m") {
							if (i < 0) {
								// console.log("a");
								im = i + 12;
							}
							else if (i > 12) {
								// console.log("b");
								im = i - 11;
							}
							else {
								// console.log("c");
								im = i;
							}
							
							// console.log(im);
							
							if (this.offsetWidth > 500) {
								inputLabel.innerText = monthName[im]["normal"];
							}
							else {
								inputLabel.innerText = monthName[im]["short"];
							}
						}
						else {
							inputLabel.innerText = i;
							
							im = i;
						}
						
						input.id = name + im;
						input.onclick = fnSelect;
						
						input.name = name;
						input.value = i;
						
						inputLabel.htmlFor = input.id;
						
						whereDom.appendChild(input);
						whereDom.appendChild(inputLabel);
					}
				}
				
				if (showArrows == true) {
					let btnNext = document.createElement("button");
					btnNext.innerText = ">>";
					
					if (nextOnclick) {
						btnNext.onclick = nextOnclick;
					}
					
					whereDom.appendChild(btnNext);
				}
			};
			
			for (let letter of confDT.format) {
				if (letter == "Y") {
					let prevClick, nextClick;
					
					prevClick = function(){
						sYearMove -= 1;
						testFun(sYear+sYearMove-1, sYear+sYearMove+1, "sYears", "sYear", "Y", prevClick, nextClick, true);
					};
					
					nextClick = function(){
						sYearMove += 1;
						testFun(sYear+sYearMove-1, sYear+sYearMove+1, "sYears", "sYear", "Y", prevClick, nextClick, true);
					};
					
					testFun(sYear-1, sYear+1, "sYears", "sYear", "Y", prevClick, nextClick, true);
				}
				else if (letter == "m") {
					let prevClick, nextClick;
					
					prevClick = function(){
						if (sMonth+sMonthMove-2 > 0) {
							sMonthMove -= 1;
						}
						testFun(sMonth+sMonthMove-2, sMonth+sMonthMove+2, "sMonths", "sMonth", "m", prevClick, nextClick, true);
					};
					
					nextClick = function(){
						if (sMonth+sMonthMove+2 < 11) {
							sMonthMove += 1;
						}
						testFun(sMonth+sMonthMove-2, sMonth+sMonthMove+2, "sMonths", "sMonth", "m", prevClick, nextClick, true);
					};
					
					testFun(sMonth+sMonthMove-2, sMonth+sMonthMove+2, "sMonths", "sMonth", "m", prevClick, nextClick, true);
				}
				else if (letter == "d") {
					testFun(sDayStart, sDayEnd, "sDays", "sDay", "d", null, null, false);
				}
				else if (letter == "H" || letter == "h") {
					let prevClick, nextClick;
					
					prevClick = function(){
						if (sHour+sHourMove > 0) {
							sHourMove -= 1;
						}
						testFun(sHour+sHourMove, null, "sHours", "sHour", "h", prevClick, nextClick, true);
						document.getElementById("sHour").click();
					};
					
					nextClick = function(){
						if (sHour+sHourMove < 23) {
							sHourMove += 1;
						}
						testFun(sHour+sHourMove, null, "sHours", "sHour", "h", prevClick, nextClick, true);
						document.getElementById("sHour").click();
					};
					
					testFun(sHour, null, "sHours", "sHour", "h", prevClick, nextClick, true);
				}
				else if (letter == "i") {
					let prevClick, nextClick;
					
					prevClick = function(){
						if (sMinute+sMinuteMove > 0) {
							sMinuteMove -= 1;
						}
						testFun(sMinute+sMinuteMove, null, "sMinutes", "sMinute", "i", prevClick, nextClick, true);
						document.getElementById("sMinute").click();
					};
					
					nextClick = function(){
						if (sMinute+sMinuteMove < 59) {
							sMinuteMove += 1;
						}
						testFun(sMinute+sMinuteMove, null, "sMinutes", "sMinute", "i", prevClick, nextClick, true);
						document.getElementById("sMinute").click();
					};
					
					testFun(sMinute, null, "sMinutes", "sMinute", "i", prevClick, nextClick, true);
				}
				else if (letter == "s") {
					let prevClick, nextClick;
					
					prevClick = function(){
						if (sSecond+sSecondMove > 0) {
							sSecondMove -= 1;
						}
						testFun(sSecond+sSecondMove, null, "sSeconds", "sSecond", "s", prevClick, nextClick, true);
						document.getElementById("sSecond").click();
					};
					
					nextClick = function(){
						if (sSecond+sSecondMove < 59) {
							sSecondMove += 1;
						}
						testFun(sSecond+sSecondMove, null, "sSeconds", "sSecond", "s", prevClick, nextClick, true);
						document.getElementById("sSecond").click();
					};
					
					testFun(sSecond, null, "sSeconds", "sSecond", "s", prevClick, nextClick, true);
				}
			}
			
			this.parentNode.insertBefore(mainFrame, this.nextSibling);
		};
	}
}

