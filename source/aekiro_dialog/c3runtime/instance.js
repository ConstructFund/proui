"use strict";

{
	const Tween = globalThis["TWEEN"];
	const C3 = self.C3;

	C3.Behaviors.aekiro_dialog.Instance = class aekiro_dialogInstance extends C3.SDKBehaviorInstanceBase {
		constructor(behInst, properties)
		{
			super(behInst);
	
			//properties
			if (properties)
			{
				this.openAnimation = properties[0];
				this.openAnimTweenFunction = properties[1];
				this.openAnimDuration = properties[2];
				this.openSound = properties[3];
				this.closeAnimation = properties[4];
				this.closeAnimTweenFunction = properties[5];
				this.closeAnimDuration = properties[6];
				this.closeSound = properties[7];
				this.closeButtonUID = properties[8];
				this.isModal = properties[9];
			}
	
			//********************
			this.proui = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
			if(this.proui){
				this.proui = this.proui.GetSingleGlobalInstance().GetSdkInstance();
			}
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_dialog = this;
			this.wi = this.GetWorldInfo();
			this.inst = this.GetObjectInstance();
			this.aekiro_dialogManager = globalThis.aekiro_dialogManager;
			this.goManager = globalThis.aekiro_goManager;
		
			//*****************************
			this.isInit = false;
			this.isOpen = false;
			
			this.tween = new Tween["Tween"]();
			this.tween_opacity = new Tween["Tween"](); //a separate tween for opacity: we don't want the opacity to be tweened by elastic 
			this.tweenObject = {};
			this.reverseTweenObject = {};
			
			this.tweenFunctions = [
				Tween["Easing"]["Linear"]["None"],
				Tween["Easing"]["Quadratic"]["Out"],
				Tween["Easing"]["Quartic"]["Out"],
				Tween["Easing"]["Exponential"]["Out"],
				Tween["Easing"]["Circular"]["Out"],
				Tween["Easing"]["Back"]["Out"],
				Tween["Easing"]["Elastic"]["Out"],
				Tween["Easing"]["Bounce"]["Out"]
			];
	
			this.goManager.eventManager.on("childrenRegistred",() =>{				
				this.setCloseButton();
				this.onCreateInit();	
			},{"once":true}); 
		}
	
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			//console.log("PostCreate dialog");
		}
	
		onCreateInit(){
			//if(this.isInit)return;
	
			
			var map = this.GetObjectInstance().GetUnsavedDataMap();
			if(!map.audioSources){
				map.audioSources = {};
			}
			var AudioSource = globalThis.AudioSource;
			this.audioSources = map.audioSources;
			this.audioSources.open = new AudioSource(this.openSound,this.GetRuntime());
			this.audioSources.close = new AudioSource(this.closeSound,this.GetRuntime());
			
			this.setVisible(false);
			//this.wi.SetX(this.wi.GetLayer().GetViewport().getLeft() - this.wi.GetWidth() - 100);
			this.wi.SetX(this.wi.GetLayer().GetViewport().getLeft());
			this.wi.SetBboxChanged();
			this.isInit = true;
		}
		
		setCloseButton(){
			if(!this.closeButtonUID)return;
	
			this.closeButton = this.goManager.gos[this.closeButtonUID];
			if(!this.closeButton){
				console.error("ProUI-Dialog: Close button not found; Please check its name !");
				return;
			}
			
			if(!this.closeButton.GetUnsavedDataMap().aekiro_button){
				console.error("ProUI-Dialog: The close button needs to have a button behavior !");
				return;
			}
	
			var self = this;
			this.closeButton.GetUnsavedDataMap().aekiro_button.callbacks.push(function(){
				self.close();
			});
		}
		
		SetOwnScale(scale){
			var layers = this.getOutLayers();
			layers.push(this.wi.GetLayer());
			
			for (var i = 0, l= layers.length; i < l; i++) {
				layers[i].SetOwnScale(scale);
			}
		}
		
		SetOpacity(opacity){
			var layers = this.getOutLayers();
			layers.push(this.wi.GetLayer());
			
			for (var i = 0, l= layers.length; i < l; i++) {
				layers[i].SetOpacity(opacity);
			}
		}
			
		setVisible(isVisible){
			var layers = this.getOutLayers();
			layers.push(this.wi.GetLayer());
			//console.log(layers);
			
			for (var i = 0, l= layers.length; i < l; i++) {
				layers[i].SetVisible(isVisible);
			}
		}
		
		getOutLayers(){
			var mylayer = this.wi.GetLayer();
			var insts = this.aekiro_gameobject.hierarchyToArray();
			var layers = [];
			
			var layer;
			for (var i = 0, l= insts.length; i < l; i++) {
				layer = insts[i].GetWorldInfo().GetLayer();
				if(layer!=mylayer && layers.indexOf(layer)==-1){
					layers.push(layer);
				}
			}
			
			return layers;
		}
		
		setInitialState(targetX,targetY,center){
			//None|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
			var initX,initY;
			var viewport = this.wi.GetLayer().GetViewport();
			
			if(this.openAnimation == 0 || this.openAnimation == 5 || this.openAnimation == 6){ //None/ScaleDown|ScaleUp
				initX = targetX;
				initY = targetY;
				if(center){
					initY = (viewport.getTop() + viewport.getBottom())/2;
					initX = (viewport.getLeft() + viewport.getRight())/2;
				}
	
				if(this.openAnimation == 5 || this.openAnimation == 6){//ScaleDown|ScaleUp
					if(this.openAnimation == 5){ //ScaleDown
						this.wi.GetLayer().SetOwnScale(2);
					}else{ //ScaleUp
						this.wi.GetLayer().SetOwnScale(0.2);
					}
					this.wi.GetLayer().SetOpacity(0);
					//this.GetRuntime().UpdateRender();
				}
			}else if(this.openAnimation == 1){ //SlideDown
				initY =  viewport.getTop() - this.wi.GetHeight()/2 - 100;
				if(center){
					initX = (viewport.getLeft() + viewport.getRight())/2;
				}else{
					initX = targetX;
				}
			}else if(this.openAnimation == 2){ //SlideUp
				initY = viewport.getBottom() + this.wi.GetHeight()/2 + 100;
				if(center){
					initX = (viewport.getLeft() + viewport.getRight())/2;
				}else{
					initX = targetX;
				}
			}else if(this.openAnimation == 3){ //SlideLeft
				initX = viewport.getRight() + this.wi.GetWidth()/2 + 100;
				if(center){
					initY = (viewport.getTop() + viewport.getBottom())/2;
				}else{
					initY = targetY;
				}
			}else if(this.openAnimation == 4){ //SlideRight
				initX = viewport.getLeft() - this.wi.GetWidth()/2 - 100;
				if(center){
					initY = (viewport.getTop() + viewport.getBottom())/2;
				}else{
					initY = targetY;
				}
			}
	
			this.wi.SetX(initX);
			this.wi.SetY(initY);
			this.wi.SetBboxChanged();
			//console.log(initX+"******"+initY);
	
		}
		
		open(_targetX,_targetY,center){
			//Can't be opened if: already opened or opening
			if(this.isOpen){//|| (this.isOpen && this.tween["isPlaying"]) ??
				return;
			}

			//console.log("ProUI-Dialog: open");
	
			//If it's closing, we stop the closing animation
			if(!this.isOpen && this.tween["isPlaying"]){
				//this.tween["isPlaying"] = false;
				this.tween["stop"]();
				//this.postClose();
			}
			this.postClose();
	
			this.aekiro_dialogManager.addDialog(this.GetObjectInstance());
	
			//console.log("%cDIALOG %d : Open","color:blue", this.inst.uid);
			this.isOpen = true;
			this.Trigger(C3.Behaviors.aekiro_dialog.Cnds.onDialogOpened);
			//in case the timescale of the game is not 1 (paused)
			if(this.GetRuntime().GetTimeScale() != 1){
				this.aekiro_gameobject.setTimeScale(1);
			}
			//set the start position of the dialog, which depends on the type of the open animation
			this.setInitialState(_targetX,_targetY,center);
			this.setVisible(true);
	
			//*******************************************
			var targetX = _targetX;
			var targetY = _targetY;
			var viewport = this.wi.GetLayer().GetViewport();
			//target = center of viewport
			if(center){
				targetX = (viewport.getLeft() + viewport.getRight())/2;
				targetY = (viewport.getTop() + viewport.getBottom())/2;
			}
	
			if(this.openAnimDuration == 0){ //If anim duration = 0 then we set animation to "no animation", otherwise wierd bug emerge
				this.openAnimation = 0;
			}
	
			
			this.isScaleAnimation = false;
			this.tweenObject.x = this.wi.GetX();
			this.tweenObject.y = this.wi.GetY();
			this.tweenObject.scale = this.wi.GetLayer().GetOwnScale();
			this.tweenObject.opacity = this.wi.GetLayer().GetOpacity();
			this.tween["setObject"](this.tweenObject);
			this.tween["easing"](this.tweenFunctions[this.openAnimTweenFunction]);
			this.tween["onComplete"](this.postOpen,this);
			//None|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
			if(this.openAnimation == 1 || this.openAnimation == 2){ //SlideDown|SlideUp
				this.tween["to"]({y: targetY }, this.openAnimDuration);
				this.reverseTweenObject.y = this.wi.GetY();
			}else if(this.openAnimation == 3 || this.openAnimation == 4){ //SlideLeft|SlideRight
				this.tween["to"]({x: targetX }, this.openAnimDuration);
				this.reverseTweenObject.x = this.wi.GetX();
			}else if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
				this.tween["to"]({ scale: 1 }, this.openAnimDuration);
				this.reverseTweenObject.scale = this.wi.GetLayer().GetOwnScale();
				
				this.tween_opacity["setObject"](this.tweenObject);
				this.tween_opacity["to"]({ opacity: 1 }, 300);
				this.tween_opacity["easing"](Tween["Easing"]["Quartic"]["Out"]);
				
				this.isScaleAnimation = true;
				this.outLayers = this.getOutLayers(); //layers of childrens not on the same layer (like a scrollview)
			}
			//*******************************************
	
			if(this.openAnimation>0){
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);
				this._StartTicking();
		
				if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
					this.tween_opacity["start"](this.GetRuntime().GetWallTime()*1000);
				}
			}else{
				this.wi.SetXY(targetX,targetY);
				this.wi.SetBboxChanged();
			}
	
			//*******************************************
			//Play Sound
			this.audioSources.open.play();
		}
	
	
		postOpen(){
			//this.showOverlay();
		}
		
		getCloseTargetPosition(){
			//None|Reverse|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
			var viewport = this.wi.GetLayer().GetViewport();
			var X = this.wi.GetX();
			var Y = this.wi.GetY();
			
			if(this.closeAnimation == 2){ //SlideDown
				Y = viewport.getBottom() + this.wi.GetHeight()/2 + 100;
			}else if(this.closeAnimation == 3){ //SlideUp
				Y = viewport.getTop() - this.wi.GetHeight()/2 - 100;
			}else if(this.closeAnimation == 4){ //SlideLeft
				X = viewport.getLeft() - this.wi.GetWidth()/2 - 100;
			}else if(this.closeAnimation == 5){ //SlideRight
				X = viewport.getRight() + this.wi.GetWidth()/2 + 100;
			}
	
			return {x:X,y:Y};
		}
	
		close(){
			//console.log("%cDIALOG %d : Close","color:blue", this.inst.uid);
			//Can't be closed if: already closed or opening or closing
			if(!this.isOpen || this.tween["isPlaying"]){
				return;
			}
			this.isOpen = false;
			this.aekiro_dialogManager.removeDialog(this.GetObjectInstance());
			this.Trigger(C3.Behaviors.aekiro_dialog.Cnds.onDialogClosed);
		
			//**************************************	
			//None|Reverse|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
			//*******************************************
			var target = this.getCloseTargetPosition();
			var targetX = target.x;
			var targetY = target.y;
	
	
			if(this.closeAnimDuration == 0){ //If anim duration = 0 then we set animation to "no animation", otherwise wierd bug emerge
				this.closeAnimation = 0;
			}
	
			this.isScaleAnimation = false;
			this.tweenObject.x = this.wi.GetX();
			this.tweenObject.y = this.wi.GetY();
			this.tweenObject.scale = this.wi.GetLayer().GetOwnScale();
			this.tweenObject.opacity = this.wi.GetLayer().GetOpacity();
			this.tween["setObject"](this.tweenObject);
			this.tween["easing"](this.tweenFunctions[this.closeAnimTweenFunction]);
			this.tween["onComplete"](this.postClose,this);
	
			if(this.closeAnimation==2 || this.closeAnimation==3){ //SlideDown|SlideUp
				this.tween["to"]({ y: targetY }, this.closeAnimDuration);
			}else if(this.closeAnimation == 4 || this.closeAnimation == 5){ //SlideLeft|SlideRight
				this.tween["to"]({ x: targetX }, this.closeAnimDuration);
			}else if(this.closeAnimation == 6 || this.closeAnimation == 7){ //ScaleDown|ScaleUp
				if(this.closeAnimation == 6){ //ScaleDown
					this.tween["to"]({ scale: 0.2 }, this.closeAnimDuration);
				}else{ //ScaleUp
					this.tween["to"]({ scale: 2 }, this.closeAnimDuration);
				}
				
				this.tween_opacity["setObject"](this.tweenObject);
				this.tween_opacity["to"]({ opacity: 0 }, 300);
				this.tween_opacity["easing"](Tween["Easing"]["Quartic"]["Out"]);
				
				this.isScaleAnimation = true;
				this.outLayers = this.getOutLayers(); //layers of childrens not on the same layer (like a scrollview)
				
			}else if(this.closeAnimation==1){ //Reverse
				this.tween["to"](this.reverseTweenObject, this.openAnimDuration);
	
				if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
					this.isScaleAnimation = true;
					this.tween_opacity["to"]({ opacity: 0 }, 300);
				}
			}
			//*******************************************
	
	
			if(this.closeAnimation==0 || (this.openAnimation==0 && this.closeAnimation==1) ) { //Reverse
				this.postClose();
			}else if(this.closeAnimation==1){ //None
				if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
					this.tween_opacity["start"](this.GetRuntime().GetWallTime()*1000);
				}
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);
				this._StartTicking();
			}else{ //SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);
				if(this.closeAnimation == 6 || this.closeAnimation == 7){ //ScaleDown|ScaleUp
					this.tween_opacity["start"](this.GetRuntime().GetWallTime()*1000);
				}
				this._StartTicking();
			}
	
			//Play Sound
			this.audioSources.close.play();
			
		}
		
		postClose(){
			var layer = this.wi.GetLayer();
			var viewport = layer.GetViewport();
			this.SetOwnScale(1);
			this.SetOpacity(1);
			this.setVisible(false);
			//this.GetRuntime().UpdateRender();
	
			var x = (viewport.getLeft() + viewport.getRight())/2;
			var y = viewport.getTop() - this.wi.GetHeight()/2 -100;
			this.wi.SetX(x);
			this.wi.SetY(y);
			this.wi.SetBboxChanged();
			
			this._StopTicking();
		}
		
	
		Tick(){
			
			var layer;
			if(this.tween["isPlaying"]){
				this.tween["update"](this.GetRuntime().GetWallTime()*1000);
				
				if(this.isScaleAnimation){ //ScaleDown|ScaleUp
					layer = this.wi.GetLayer();
					layer.SetOwnScale(this.tweenObject.scale);
					for (var i = 0, l = this.outLayers.length; i < l; i++) {
						this.outLayers[i].SetOwnScale(this.tweenObject.scale);
					}
				}else{
					this.wi.SetXY(this.tweenObject.x,this.tweenObject.y);
					this.wi.SetBboxChanged();
				}
			}
	
			//used only with ScaleDown|ScaleUp
			if(this.tween_opacity["isPlaying"]){
				this.tween_opacity["update"](this.GetRuntime().GetWallTime()*1000);
				layer.SetOpacity(this.tweenObject.opacity);
				
				for (var i = 0, l = this.outLayers.length; i < l; i++) {
					this.outLayers[i].SetOpacity(this.tweenObject.opacity);
				}
			}
	
			//console.log("tick");
			if(!this.tween["isPlaying"]){
				this._StopTicking();
			}
		}
	
		Release(){
			this.aekiro_dialogManager.removeDialog(this.GetObjectInstance());
			
			super.Release();
		}
	
		SaveToJson(){
			return {
				"openAnimation": this.openAnimation,
				"openAnimTweenFunction": this.openAnimTweenFunction,
				"openAnimDuration": this.openAnimDuration,
				"openSound": this.openSound,
				"closeAnimation": this.closeAnimation,
				"closeAnimTweenFunction": this.closeAnimTweenFunction,
				"closeAnimDuration": this.closeAnimDuration,
				"closeSound": this.closeSound,
				"closeButtonUID":this.closeButtonUID,
				"isModal": this.isModal
			};
		}
	
		LoadFromJson(o){
			this.openAnimation = o["openAnimation"];
			this.openAnimTweenFunction = o["openAnimTweenFunction"];
			this.openAnimDuration = o["openAnimDuration"];
			this.openSound = o["openSound"];
			this.closeAnimation = o["closeAnimation"];
			this.closeAnimTweenFunction = o["closeAnimTweenFunction"];
			this.closeAnimDuration = o["closeAnimDuration"];
			this.closeSound = o["closeSound"];
			this.closeButtonUID = o["closeButtonUID"];
			this.isModal = o["isModal"];
		}
	
	
	}
	
}

