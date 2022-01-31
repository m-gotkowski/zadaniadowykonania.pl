
function alertNew (alertObj) {
	/*
	v: 1.1
	
	alertObj = {
		"title": "",
		"message": "",
		"style": "default", // default, success, error
		"radius": false,
		"inputs": [
			{
				"class": null, // css classes, string
				"id": null,
				"type": "text" // area, text, select, checkbox, radio
				"name": "",
				"label": "",
				"placeholder": "",
				"required": false,
				"checked": false // for checkbox, radio
			}
		],
		"buttonSubmit": "Ok",
		"buttonCancel": "Cancel",
		"fnCallback": null,
		"fnSubmit": null
	};
	
	*/
	
	let inputType = ["text", "area", "text", "select", "checkbox", "radio"];
	
	if (typeof alertObj == "undefined" || alertObj == undefined || alertObj == null) {
		alertObj = {};
	}
	
	let div;
	
	if (document.getElementById("alertNew") == null) {
		div = document.createElement("div");
		div.id = "alertNew";
	}
	else {
		div = document.getElementById("alertNew");
	}
	
	let divContent = document.createElement("div");
	let pm = document.createElement("p");
	pm.innerHTML = (alertObj.message == undefined) ? "" : alertObj.message;
	let btnSubmit = document.createElement("button");
	btnSubmit.type = "button";
	btnSubmit.innerHTML = (alertObj.buttonSubmit == undefined) ? "Ok" : alertObj.buttonSubmit;
	
	let btnCancel = null;
	
	if (typeof alertObj.buttonCancel != "undefined") {
		btnCancel = document.createElement("button");
		btnCancel.type = "button";
		btnCancel.innerHTML = alertObj.buttonCancel;
	}
	
	
	if (alertObj.radius === true) {
		divContent.classList.add("alertNewRadius");
	}
	
	divContent.classList.add((alertObj.style == undefined || alertObj.style == "" || alertObj.style == null) ? "default" : alertObj.style);
	
	let divClose = document.createElement("button");
	divClose.classList.add("alertClose");
	divClose.innerText = "X";
	divClose.onclick = function(){
		if (document.getElementById("alertNew").childElementCount == 1) {
			document.body.removeChild(document.getElementById("alertNew"));
		}
		else {
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		}
		
		return false;
	};
	
	if (alertObj.title != undefined && alertObj.title != "") {
		let divTitle = document.createElement("div");
		divTitle.classList.add("alertTitle");
		divTitle.innerHTML = alertObj.title;
		
		divTitle.appendChild(divClose);
		divContent.appendChild(divTitle);
	}
	
	divContent.appendChild(pm);
	
	let formNew = null;
	
	if (alertObj.inputs != undefined && alertObj.inputs != null && alertObj.inputs.length > 0) {
		
		formNew = document.createElement("form");
		formNew.id = "alertNewForm";
		for (let item of alertObj.inputs) {
			let itemTmp = null;
			
			if (item.type != undefined && inputType.includes(item.type)) {
				// let inputType = ["text", "area", "text", "select", "checkbox", "radio"];
				
				if (item.type == "text") {
					itemTmp = document.createElement("input");
					
					if (item.placeholder != null && item.placeholder != undefined) {
						itemTmp.placeholder = item.placeholder;
					}
				}
				
				if (typeof item.class != "undefined" && item.class != null) {
					itemTmp.classList.add(item.class); // add check if is multiple
				}
				
				if (typeof item.id != "undefined" && item.id != null) {
					itemTmp.id = item.id;
				}
			}
			else {
				
			}
			
			formNew.appendChild(itemTmp);
		}
		
		// formNew.addEventListener("submit", (ev) => {
		// 	ev.preventDefault();
		// 	// ev.stopPropagation();
			
		// 	console.log("run onsubmit");
		// 	return false;
		// });
		
		
		divContent.appendChild(formNew);
		
		
	}
	
	btnSubmit.addEventListener("click", (ev) => {
		ev.preventDefault();
		
		if (typeof alertObj.fnCallback == "function") {
			alertObj.fnCallback();
		}
		
		if (formNew != null) {
			if (typeof alertObj.fnSubmit == "function") {
				alertObj.fnSubmit();
			}
			
			// formNew.submit();
		}
		
		if (document.getElementById("alertNew").childElementCount == 1) {
			document.body.removeChild(document.getElementById("alertNew"));
		}
		else {
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		}
		
		// return false;
		
		// if (this.parentNode.parentNode.childElementCount == 1) {
		// 	this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		// }
		// else {
		// 	this.parentNode.parentNode.removeChild(this.parentNode);
		// }
		
		return false;
	}, false);
	
	divContent.appendChild(btnSubmit);
	if (btnCancel != null) {
		btnCancel.addEventListener("click", (ev) => {
			ev.preventDefault();
			// ev.stopPropagation();
			
			if (document.getElementById("alertNew").childElementCount == 1) {
				document.body.removeChild(document.getElementById("alertNew"));
			}
			else {
				this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			}
			
			return false;
		}, false);
		
		divContent.appendChild(btnCancel);
	}
	
	div.appendChild(divContent);
	
	document.body.appendChild(div);
}