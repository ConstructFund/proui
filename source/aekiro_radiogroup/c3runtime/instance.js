"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_radiogroup.Instance = class aekiro_radiogroupInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			//properties
			this.value  = properties[0];
			//**************************
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_radiogroup = this;
			this.radioButtons = [];
			this.isEnabled = true;
			this.goManager = globalThis.aekiro_goManager;
			
			this.goManager.eventManager.on("childrenRegistred",() => this.init(),{"once":true});
		}
		
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			if(this.aekiro_gameobject){
				this.aekiro_gameobject.eventManager.on("cloned",() => this.init(),{"once":true});
			}
		}

		GetRadioButtons(){
			return this.aekiro_gameobject.children;
		}

		init(){
			if(!this.aekiro_gameobject){
				return;
			}
			
			this.radioButtons = this.GetRadioButtons();
			
			var b;
			var l = this.radioButtons.length;
			for (var i = 0; i < l; i++) {
				b = this.radioButtons[i].GetUnsavedDataMap().aekiro_radiobutton;
				b.init();
			}
			
			this.updateView();
			
			//console.log(this.radioButtons);
			//console.log("init radiogroup" + this.GetObjectInstance().GetUID());
		}
	
		
		isValueValid(value){
			var b;
			var radioButtons = this.GetRadioButtons();
			for (var i = 0; i < radioButtons.length; i++) {
				b = radioButtons[i].GetUnsavedDataMap().aekiro_radiobutton;
				if(b.name == value){
					return true;
				}
			}
			return false;			
		}

		setValue(value){
			if(!this.isValueValid(value)){
				return false;
			}
			var radioButtons = this.GetRadioButtons();

			var b,l=radioButtons.length;
			for (var i = 0; i < l; i++) {
				b = radioButtons[i].GetUnsavedDataMap().aekiro_radiobutton;
				if(b.name == value){
					this.value = value;
					b.setValue(1);
				}else{
					b.setValue(0);
				}
			}
		}
		
		updateView(){
			var areAllDisabled = true;
			var radioButtons = this.GetRadioButtons();
			for (var i = 0; i < radioButtons.length; i++) {
				var b = radioButtons[i].GetUnsavedDataMap().aekiro_radiobutton;
				if(b.name == this.value){
					b.setValue(1);
				}else{
					b.setValue(0);
				}
				if(b.isEnabled){
					areAllDisabled = false;
				}
			}
			
			if(areAllDisabled){
				this.isEnabled = false;
			}	
		}
		
		Release(){
			super.Release();
		}
	
		SaveToJson(){
			return {
				"value":this.value,
			};
		}
	
		LoadFromJson(o){
			this.value = o["value"];
		}
	};

}
