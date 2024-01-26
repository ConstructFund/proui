"use strict";

{
	const Tween = globalThis["TWEEN"];
	const C3 = self.C3;

	C3.Behaviors.aekiro_progress.Instance = class aekiro_progressInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			if (properties){
				this.maxValue = properties[0];
				this.value  = C3.clamp(properties[1],0,this.maxValue);
				this.animation = properties[2];
			}
	
			this.inst = this.GetObjectInstance();
			this.wi = this.GetWorldInfo();
			this.goManager = globalThis.aekiro_goManager;
			
			const cb  = () => {
				if(!this._objectClass){
					//this.goManager.eventManager.removeListener(cb);
					return; //this is a bad hack
				}
				this.init();
			}
			this.goManager.eventManager.on("childrenRegistred",cb,{"once":true});
			//******************************************
		}
	
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			if(this.aekiro_gameobject){
				this.aekiro_gameobject.eventManager.on("cloned",() => this.init(),{"once":true});
			}
			this.init();
		}
	
		init(){
			var wi = this.wi;
			this.initWidth = wi.GetWidth();
			
			this.transf = {width:wi.GetWidth()};
			this.tween = new Tween["Tween"](this.transf);
			if(this.animation == 1){
				this.tween["easing"](Tween["Easing"]["Linear"]["None"]);
			}else if(this.animation == 2){
				this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"]);
			}
			this.updateView();
		}
		
		onInitPropsLoaded(){
			var wi = this.wi;
			wi.SetWidth(this.initWidth,true);		
		}

			
		isValueValid(value){
			if(value == null || isNaN(value) || value === ""){
				return false;
			}
			return true;			
		}

		setMaxValue(v){
			this.maxValue = v;
			this.value = C3.clamp(this.value,0,this.maxValue);
			this.updateView();
		}

		setValue(value){
			if(!this.isValueValid(value)){
				return false;
			}
			value = C3.clamp(value,0,this.maxValue);
			if(this.value!=value){
				this.value = value;
				this.updateView();
			}
		}
	
		updateView(){
			var targetProp = 0;
			
			var progress = this.value/this.maxValue;
			

			targetProp = progress*this.initWidth;
	
			if(this.animation){
				var wi = this.wi;
				this.transf.width = wi.GetWidth();
				this.tween["to"]({ width:targetProp}, 500)["start"]();
				
				this._StartTicking();
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);
			}else{
				this.wi.SetWidth(targetProp,true);
				this.wi.SetBboxChanged();
				if(this.tween["isPlaying"]){
					this.tween["stop"]();
					this.isTweenPlaying = false;
				}
			}
		}
	
		Tick ()	{
			if(this.isTweenPlaying){
				this.isTweenPlaying = false;
			}
	
			if(this.tween["isPlaying"]){
				this.tween["update"](this.GetRuntime().GetWallTime()*1000);
				this.isTweenPlaying = true;
			}
	
			if(this.isTweenPlaying){
				this.wi.SetWidth(this.transf.width,true);	
				this.wi.SetBboxChanged();
			}else{
				this._StopTicking();	
			}
		}
		
		Release()
		{
			super.Release();
		}
	
		SaveToJson(){
			return {
				"maxValue":this.maxValue,
				"value":this.value,
				"animation":this.animation,
				"initWidth": this.initWidth
			}
		}
	
		LoadFromJson(o){
			this.maxValue = o["maxValue"];
			this.value = o["value"];
			this.animation = o["animation"];
			this.initWidth = o["initWidth"];
			
			this.onInitPropsLoaded();
		}
		
		
	};
}
