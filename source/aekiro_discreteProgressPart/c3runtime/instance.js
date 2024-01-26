"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_discreteProgressPart.Instance = class aekiro_discreteProgressPartInstance extends C3.SDKBehaviorInstanceBase {
		constructor(behInst, properties)
		{
			super(behInst);
	
			//properties
			this.index  = properties[0];
			this.frameAnim_0  = properties[1];
			this.frameAnim_05  = properties[2];
			this.frameAnim_1  = properties[3];
			//**************************
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_discreteProgressPart = this;
			this.goManager = globalThis.aekiro_goManager;
			this.frameAnim = [];		
		}
	
		PostCreate(){
			this.sdkInstance = this.GetObjectInstance().GetSdkInstance();
			this.sdkInstance_exps = this.GetObjectInstance().GetPlugin().constructor.Exps;
			this.sdkInstance_acts = this.GetObjectInstance().GetPlugin().constructor.Acts;
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
			//**************************
			this.onPropsLoaded();
		}
		
		
		onPropsLoaded(){
			this.setInitProps();
			this.initFrameAnim();
		}
		
		setInitProps(){
			this.initProps = {
				animationFrame : null,
				animationName : null
			};
			
			this.initProps.animationFrame = this.initProps.animationFrame===null?this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationFrame):this.initProps.animationFrame;
			this.initProps.animationName = this.initProps.animationName || this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationName);	
			
		}
		
		initFrameAnim(){
			this.frameAnim[0] = this.parseFrameAnim(this.frameAnim_0);
			this.frameAnim[1] = this.parseFrameAnim(this.frameAnim_05);
			this.frameAnim[2] = this.parseFrameAnim(this.frameAnim_1);
		}
		
		setFrameAnim(state){
			//console.log(this.frameAnim);
			var anim = this.frameAnim[state]["a"];
			var frame = this.frameAnim[state]["f"];
			if(anim){
				this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnim,anim,0);
			}
			this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnimFrame,frame,0);
		}
		
		
		parseFrameAnim(frameAnim,defaults){
			//return;
			if(frameAnim==undefined)frameAnim="";
	
			frameAnim = frameAnim.split('/');
			var frame,anim;
			if(isNaN(parseInt(frameAnim[0]))){
				anim = frameAnim[0];
				frame = parseInt(frameAnim[1])
			}else{
				anim = frameAnim[1];
				frame = parseInt(frameAnim[0]);
			}
			if(isNaN(frame)){
				frame = defaults?defaults["f"]:this.initProps.animationFrame;
			}
			if(!isNaN(anim) || !anim){
				anim = defaults?defaults["a"]:this.initProps.animationName;
			}
			var res =  {
				"f": frame,
				"a": anim
			};
			return res;
		}
		
		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
				"index" : this.index,
				"frameAnim_0" :  this.frameAnim_0,
				"frameAnim_05" : this.frameAnim_05,
				"frameAnim_1": this.frameAnim_1
			};
		}
	
		LoadFromJson(o)
		{
			this.index  = o["index"];
			this.frameAnim_0  = o["frameAnim_0"];
			this.frameAnim_05  = o["frameAnim_05"];
			this.frameAnim_1  = o["frameAnim_1"];
			
			this.onPropsLoaded();
		}
	};
}
