"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_discreteProgress.Instance = class aekiro_discreteProgressInstance extends C3.SDKBehaviorInstanceBase {
		constructor(behInst, properties)
		{
			super(behInst);
			//properties
			this.value  = properties[0];
			
			//**************************
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_discreteProgress = this;
			this.parts = [];
			this.goManager = globalThis.aekiro_goManager;
			
			this.goManager.eventManager.on("childrenRegistred",() => this.init(),{"once":true});
		}
	
	
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			if(this.aekiro_gameobject){
				this.aekiro_gameobject.eventManager.on("cloned",() => this.init(),{"once":true});
			}
		}
		
		init(){
			if(!this.aekiro_gameobject){
				return;	
			}
			var children = this.aekiro_gameobject.children;
			this.max = children.length;
			var b;
			var l = this.max;
			for (var i = 0; i < l; i++) {
				b = children[i].GetUnsavedDataMap().aekiro_discreteProgressPart;
				this.parts[b.index] = children[i];
				b.PostCreate();
			}
			
			this.value = C3.clamp(this.value,0,this.max);
			this.updateView();
			//console.log(this.parts);
		}

		isValueValid(value){
			if(value == null || isNaN(value) || value === ""){
				return false;
			}
			return true;			
		}
		
		setValue(value){
			if(!this.isValueValid(value)){
				return false;
			}
			value = C3.clamp(value,0,this.max);
			if(this.value!=value){
				this.value = value;	
				this.updateView();
			}
		}
		
		updateView(){
			var b;
			for (var i = 0; i < this.max; i++) {
				b = this.parts[i].GetUnsavedDataMap().aekiro_discreteProgressPart;
				b.setFrameAnim(0);
			}
			
			var integer = Math.floor(this.value);
			var remainder = this.value % 1;
			
			for (var i = 0; i < integer; i++) {
				b = this.parts[i].GetUnsavedDataMap().aekiro_discreteProgressPart;
				b.setFrameAnim(2);
			}
			
			if(i < this.max && remainder >= 0.5){
				b = this.parts[i].GetUnsavedDataMap().aekiro_discreteProgressPart;
				b.setFrameAnim(1);
			}
		}
		
	
	
		
		
		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
				"value": this.value
			};
		}
	
		LoadFromJson(o)
		{
			this.value  = o["value"];
		}
	};
	
	
	
}
