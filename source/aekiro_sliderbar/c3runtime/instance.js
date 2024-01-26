"use strict";

{
	const C3 = self.C3;
	const HORIZONTAL = 0;
	const VERTICAL = 1;
	C3.Behaviors.aekiro_sliderbar.Instance = class aekiro_sliderbarInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			//properties
			if (properties){
				this.isEnabled = properties[0];
				this.value  = properties[1];
				this.minValue = properties[2];
				this.maxValue = properties[3];
				this.step  = C3.clamp(properties[4],1,Infinity);
				this.padding = properties[5];
				this.onValueChangedSound = properties[6];
				this.direction = properties[7];
			}
			
			this.proui = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
			if(this.proui){
				this.proui = this.proui.GetSingleGlobalInstance().GetSdkInstance();
			}
			
			this.inst = this.GetObjectInstance();
			this.wi = this.GetWorldInfo();
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_sliderbar = this;
			this.goManager = globalThis.aekiro_goManager;
			this.aekiro_dialogManager = globalThis.aekiro_dialogManager;
			this.goManager.eventManager.on("childrenRegistred",() => this.init(),{"once":true});
			this.initSounds();
			//******************************************
			this.isSliderBarTouched = false;
			this.isSliding = false;
			this.prevValue = this.value;
					
		}
	
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			if(this.aekiro_gameobject){
				this.aekiro_gameobject.eventManager.on("cloned",() => this.init(),{"once":true});
			}
		}
		
		initSounds(){
			var map = this.GetObjectInstance().GetUnsavedDataMap();
			if(!map.audioSources){
				map.audioSources = {};
			}
			var AudioSource = globalThis.AudioSource;
	
			this.audioSources = map.audioSources;
			this.audioSources.onValueChangedSound = new AudioSource(this.onValueChangedSound,this.GetRuntime());
		}

		init (){
			if(!this.aekiro_gameobject){
				return;	
			}
			
			this.sliderButton = this.aekiro_gameobject.children[0];
			if(!this.sliderButton){
				console.error("ProUI-SLIDERBAR: Slider button not found, please check its name");
				return;
			}
			this.sliderWi = this.sliderButton.GetWorldInfo();
			
			//Place the slider
			let startX,startY;
			if(this.direction == HORIZONTAL){
				startX = this.wi.GetBoundingBox().getLeft()+this.padding;
				startY = (this.wi.GetBoundingBox().getBottom()+this.wi.GetBoundingBox().getTop())/2;
			}else{
				startX = (this.wi.GetBoundingBox().getRight()+this.wi.GetBoundingBox().getLeft())/2;
				startY = this.wi.GetBoundingBox().getBottom()-this.padding;
			}
			//placing the sliderbutton at the left-center of the bar
			this.sliderWi.SetX(startX);
			this.sliderWi.SetY(startY);
			this.sliderWi.SetBboxChanged();
			
			
			
			//var max_x = this.wi.GetBoundingBox().getRight()-this.padding;
			const barLength = this.getBarLength();			
			this.widthStep = (this.step/(this.maxValue-this.minValue))*barLength;
			this.thres = this.widthStep*2/3;
			this.precis = this.step/(this.maxValue-this.minValue);
			this.lastStop = this.direction == HORIZONTAL? startX : startY;
			
			//
			this.wi.SetWidth_old2 = this.wi.SetWidth;
			this.wi.SetWidth = function(v,onlyNode){
				var prev = this.GetWidth();
				this.SetWidth_old2(v,onlyNode);
				if(v != prev){
					this.GetInstance().GetUnsavedDataMap().aekiro_sliderbar.OnSizeChanged();
				}
			};

			this.setValue(this.value);
		}

		getBarLength(){
			let barLength;
			if(this.direction == HORIZONTAL){
				const width = this.wi.GetBoundingBox().getRight() - this.wi.GetBoundingBox().getLeft();
				barLength = width -2*this.padding;
			}else{
				const height = this.wi.GetBoundingBox().getBottom() - this.wi.GetBoundingBox().getTop();
				barLength = height-2*this.padding;
			}
			return barLength;
		}
		
		OnSizeChanged(){
			this.sliderWi.SetBboxChanged();
			this.wi.SetBboxChanged();
			
			const barLength = this.getBarLength();
			this.widthStep = (this.step/(this.maxValue-this.minValue))*barLength;
			this.thres = this.widthStep*2/3;
			this.updateView();
			
			//console.log("sliderBar OnSizeChanged");
		}


		isValueValid(value){
			if(value == null || isNaN(value) || value === ""){
				return false;
			}
			return true;			
		}

		// step=3 v=6+2/3
		// test2: step=3 min=0 max=6+2/3 ; v=6+2/3 
		// test3: step=3 min=1 max=7+2/3 ; v=6+2/3 v=0
		setValue (value){
			if(!this.isValueValid(value)){
				return false;
			}
			this.value = value - value%this.step + (value%this.step>=this.step*2/3?this.step:0);
			this.value = C3.clamp(this.value, this.minValue, this.maxValue);
			this.updateView();
		}
		
		updateView (){
			if(this.direction == HORIZONTAL){
				var startX = this.wi.GetBoundingBox().getLeft()+this.padding;
				var endX = this.wi.GetBoundingBox().getRight()-this.padding;			
				var x = startX + ((this.value-this.minValue)/this.step)*this.widthStep;
				this.sliderWi.SetX(C3.clamp(x,startX,endX));
				this.sliderWi.SetY((this.wi.GetBoundingBox().getBottom()+this.wi.GetBoundingBox().getTop())/2);
				this.sliderWi.SetBboxChanged();
				this.lastStop = this.sliderWi.GetX()-startX;
			}else{
				var startY = this.wi.GetBoundingBox().getBottom()-this.padding;
				var endY = this.wi.GetBoundingBox().getTop()+this.padding;			
				var y = startY - ((this.value-this.minValue)/this.step)*this.widthStep;
				this.sliderWi.SetY(C3.clamp(y,endY,startY));
				this.sliderWi.SetX((this.wi.GetBoundingBox().getRight()+this.wi.GetBoundingBox().getLeft())/2);
				this.sliderWi.SetBboxChanged();
				this.lastStop = startY - this.sliderWi.GetY();
			}
			//console.log(this.lastStop);
		}
		
		OnAnyInputDown(x, y){
			if(!this.isEnabled || !this.isInteractible(x,y))return;
			
			this.prevValue = this.value;
			
			if(this.direction == HORIZONTAL){
				this.sliderOffsetX = 0;
				if(this.sliderButton && this.sliderButton.GetWorldInfo().ContainsPoint(x, y)){
					this.sliderOffsetX = x - this.sliderWi.GetX();
					this.isSliding = true;
				}
				if(this.wi.ContainsPoint(x, y)){
					this.onX(x);
				}
			}else{
				this.sliderOffsetY = 0;
				if(this.sliderButton && this.sliderButton.GetWorldInfo().ContainsPoint(x, y)){
					this.sliderOffsetY = this.sliderWi.GetY() - y;
					this.isSliding = true;
				}
				if(this.wi.ContainsPoint(x, y)){
					this.onY(y);
				}
			}
	
		}
		
		OnAnyInputMove(x,y) {
			if(this.isSliding){
				if(this.direction == HORIZONTAL){
					this.onX(x);
				}else{
					this.onY(y);
				}
			}
		}
		
		onX (touchX){
			var min_x = this.wi.GetBoundingBox().getLeft()+this.padding;
			var max_x = this.wi.GetBoundingBox().getRight()-this.padding;
			
			const barLength = this.getBarLength();
			
			
			if(this.precis>0.04){
				//console.log(this.lastStop);
				touchX =  C3.clamp(touchX,min_x-1,max_x+1);
				var diff = touchX-(min_x+this.lastStop);
				if(Math.abs(diff) > this.thres){
					diff = C3.clamp(diff,-this.widthStep,this.widthStep);
					this.lastStop = this.lastStop + Math.sign(diff)*this.widthStep;
					this.sliderWi.SetX(C3.clamp(min_x+this.lastStop,min_x,max_x));
					this.sliderWi.SetBboxChanged();
					this.value += Math.sign(diff)*this.step;
					this.value = C3.clamp(this.value,this.minValue,this.maxValue);
				}
			}else{
				var x = touchX - this.sliderOffsetX;
				x =  C3.clamp(x,min_x-1,max_x+1);
				
				this.sliderWi.SetX(C3.clamp(x,min_x,max_x));
				this.sliderWi.SetBboxChanged();
				this.value = ((this.sliderWi.GetX()-min_x)/barLength)*(this.maxValue-this.minValue);
				this.value = this.minValue+Math.round(this.value/this.step)*this.step;
				this.value = C3.clamp(this.value,this.minValue,this.maxValue);
				
				//console.log(this.value);
			}
		}
			
		
		onY (touchY){
			const min_y = this.wi.GetBoundingBox().getBottom()-this.padding;
			const max_y = this.wi.GetBoundingBox().getTop()+this.padding;
			const barLength = this.getBarLength();
			
			if(this.precis>0.04){
				//console.log(this.lastStop);
				touchY =  C3.clamp(touchY,max_y-1,min_y+1);
				var diff = (min_y-this.lastStop)-touchY;
				if(Math.abs(diff) > this.thres){
					diff = C3.clamp(diff,-this.widthStep,this.widthStep);
					this.lastStop = this.lastStop + Math.sign(diff)*this.widthStep;
					this.sliderWi.SetY(C3.clamp(min_y-this.lastStop,max_y,min_y));
					this.sliderWi.SetBboxChanged();
					this.value += Math.sign(diff)*this.step;
					this.value = C3.clamp(this.value,this.minValue,this.maxValue);
				}
			}else{
				let y = touchY + this.sliderOffsetY;
				y =  C3.clamp(y,max_y-1,min_y+1);

				this.sliderWi.SetY(C3.clamp(y,max_y,min_y));
				this.sliderWi.SetBboxChanged();
				
				const d  = Math.abs(min_y-this.sliderWi.GetY());
				this.value = (d/barLength)*(this.maxValue-this.minValue);
				this.value = this.minValue+Math.round(this.value/this.step)*this.step;
				this.value = C3.clamp(this.value,this.minValue,this.maxValue);
				
			}
		}
		
		OnAnyInputUp(x, y) {
			if(!this.isEnabled){
				return;
			}
			
			this.isSliding = false;
			
			if(this.prevValue != this.value){
				this.audioSources.onValueChangedSound.play();
				this.Trigger(C3.Behaviors.aekiro_sliderbar.Cnds.OnChanged);
			}
		}
		
		isInteractible(x,y){
			if(this.proui.ignoreInput){
				return false;
			}
			
			var isUnder = false;
			if(this.aekiro_dialogManager){
				isUnder = this.aekiro_dialogManager.isInstanceUnder(this.wi.GetLayer().GetIndex());
			}
			//console.log(isUnder,isOverlaped);
			return !isUnder;
		}
		
		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
			"isEnabled": this.isEnabled,
			"value" : this.value,
			"minValue" : this.minValue,
			"maxValue" : this.maxValue,
			"step"  : this.step 
			};
		}
	
		LoadFromJson(o)
		{
			this.isEnabled = o["isEnabled"];
			this.value  = o["value"];
			this.minValue = o["minValue"];
			this.maxValue = o["maxValue"];
			this.step  = o["step"];
		}
	};
	
}
