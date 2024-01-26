"use strict";


{
	const C3 = self.C3;

	C3.Plugins.aekiro_proui.Instance = class aekiro_prouiSingleGlobalInstance extends C3.SDKInstanceBase
	{
		constructor(inst, properties){
			super(inst,properties);
	
			this.ignoreInput = false;
			this.stopClickPropagation = properties[0];

			this.goManager = globalThis.aekiro_goManager;
			
			this.goManager.init(this.GetRuntime());
			this.lastLayout = null;
			
			this.GetRuntime().Dispatcher().addEventListener("beforelayoutchange", () =>{
				//console.log("beforelayoutchange");
				this.goManager.isInit = false;
			});

			//console.log('%c%s','color: black; background: yellow','Change starting from this Version: Add the "initialise" action of ProUI plugin on "start of layout" of every layout using ProUI.');
		}
	
		Initialise()
		{
			/*if(this.lastLayout == this.GetRuntime().GetMainRunningLayout().GetName())return;
			this.lastLayout = this.GetRuntime().GetMainRunningLayout().GetName();*/
			//console.log("ProUI: Initialise");
			this.goManager.gos = {};
			this.goManager.registerGameObjects();
			this.goManager.cleanSceneGraph();
			this.goManager.createSceneGraph();
			this.goManager.isInit = true;
		}
	
		setUIAudioVolume(volume){
			var list = [C3.Behaviors.aekiro_button, C3.Behaviors.aekiro_checkbox, C3.Behaviors.aekiro_radiobutton, C3.Behaviors.aekiro_dialog];
	
			var behaviorBase,insts,audioSources;
			for (var i = 0, l = list.length; i < l; i++) {
				behaviorBase = this.GetRuntime()._pluginManager._behaviorsByCtor.get(list[i]);
				if(!behaviorBase)continue;
				insts = behaviorBase.GetInstances();
				for (var j = 0, m = insts.length; j < m; j++) {
					audioSources = insts[j].GetUnsavedDataMap().audioSources;
					if(!audioSources)continue;
	
					for(var key in audioSources){
						audioSources[key].setVolume(volume);
					}
				}
			}
		}
	
		isTypeValid(inst,types){
			var ctr = inst.GetPlugin().constructor;
			for (var i = 0, l= types.length; i < l; i++) {
				if(ctr == types[i]){
					return true;
				}
			}
			return false;
		}
	
		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
				// data to be saved for savegames
			};
		}
	
		LoadFromJson(o)
		{
			// load state for savegames
		}
	};
	
}

{
const Tween = self["TWEEN"];
const C3 = self.C3;

globalThis.Aekiro = {};

globalThis.AudioSource = class AudioSource {
	constructor(opts,runtime){
		//this.runtime = globalThis.c3_runtimeInterface._GetLocalRuntime();
		this.runtime = runtime;
		this.parseConfig(opts);
		if(C3.Plugins.Audio){
			this.act_PlayByName = C3.Plugins.Audio.Acts.PlayByName;
		}
	}

	parseConfig(opts){
		opts = opts.split(";");
		this.fileName = opts[0];
		this.volume = parseInt(opts[1]);
		if(!this.volume)this.volume = 0;
	}

	getAudioSdkInstance(){
		if(!this.audio){
			var plugin = this.runtime.GetSingleGlobalObjectClassByCtor(C3.Plugins.Audio);
			if(plugin){
				this.audio = plugin.GetSingleGlobalInstance().GetSdkInstance();
			}
		}
		return this.audio;
	}

	setVolume(v){
		this.volume = v;
	}

	play(){
		//console.log(this.fileName,this.volume);
		if(!this.fileName)return;
		var audio = this.getAudioSdkInstance();
		if(!audio){
			console.error("ProUI: Please add the Audio plugin to the project.");
			return;
		}
		this.act_PlayByName.call(audio,0,this.fileName, 0, this.volume, "sound");		
	}
};

globalThis.EventManager = class EventManager {
	constructor(inst){
		this.map = {};
		this.inst = inst;
	}
	on (eventName,callback,options) {
		if(!this.map[eventName]){
			this.map[eventName] = [];
		}
		
		var once = false;
		if(options){
			once = options["once"];
		}
		
		var listener = {"callback":callback,"once":once, "eventName": eventName};
		this.map[eventName].push(listener);
		
		return listener;
	}

	emit (eventName,options) {
		options = options || {};
		var listeners = this.map[eventName];
		var listener;
		//console.log(this.map);
		if(listeners){
			for (var i = 0, l=listeners.length; i < l; i++) {
				listener = listeners[i];
				listener["callback"](options["args"]);
				if(listener["once"]){
					this.removeListener(listener);
					
					l=listeners.length;
					if(l==0){
						break;
					}

					i--;
				}
			}
			
		}
		
		
		if(options["propagate"] == undefined) options["propagate"] = true;
		if(options["bubble"] == undefined) options["bubble"] = true;
		
		var options2 = Object.assign({}, options);
		options2["propagate"] = false;
		//bubble the event up the hierarchy
		if(options["bubble"] === true && this.inst){
			var go = this.inst.GetUnsavedDataMap().aekiro_gameobject;
			if(go.parent){
				go.parent.GetUnsavedDataMap().aekiro_gameobject.eventManager.emit(eventName,options2);
			}	
		}
		
		options2 = Object.assign({}, options);
		options2["bubble"] = false;
		//propagate the event down the hierarchy 
		
		if(options["propagate"] === true && this.inst){
			var go = this.inst.GetUnsavedDataMap().aekiro_gameobject;
			var children = go.children;
			for (var i = 0, l=children.length; i < l; i++) {
				children[i].GetUnsavedDataMap().aekiro_gameobject.eventManager.emit(eventName,options);
			}
		}
	}

	removeListener(listener) {
		var listeners = this.map[listener["eventName"]];
		var index = listeners.indexOf(listener);
		listeners.splice(index, 1);
	}
};


globalThis.aekiro_goManager = {
	gos : {},
	haltNext:false,
	isRegistering:false,
	eventManager: new globalThis.EventManager(),
	lastLayout:0,
	
	init : function(runtime){
		if(this.runtime)return;
		
		this.runtime = runtime;		
		//this is used instead of Release(), because Release() comes after beforelayoutstart and clears everything that was setup.
		this.runtime.Dispatcher().addEventListener("instancedestroy", function(e){
			var go = e.instance.GetUnsavedDataMap().aekiro_gameobject;
			if(go){
				go.Release2();	
			}
		});
		
	},

	clean : function(){
		var key;
		for(key in this.gos){
			if(this.gos[key].IsDestroyed()){
				this.removeGO(key);
			}
		}
	},
	
	addGO : function(inst){
		if(!inst)return;

		if(this.haltNext)return;
		
		var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;

		if(!aekiro_gameobject.name){
			aekiro_gameobject.name = "o"+inst.GetUID();
		}
		/*if(!name){
			console.error("Aekiro Hierarchy: object of uid=%s has no name !",inst.uid);
			return;
		}*/
		
		var name = aekiro_gameobject.name;
		if(this.gos.hasOwnProperty(name)){
			console.error("Aekiro Hierarchy: GameObject already exist with name: %s !",name);
			aekiro_gameobject.name = "o"+inst.GetUID();
			name = aekiro_gameobject.name;
			//return;
		}
		this.gos[name] = inst;
		
	},

	removeGO : function(name){
		delete this.gos[name];
	},

	setGoName : function(oldName,newName){
		if(!this.gos[oldName]){
			throw new Error("ProUI-goManager.setGoName() : game object to be renamed not found");
		}
		if(this.gos.hasOwnProperty(newName)){
			throw new Error("ProUI-goManager.setGoName() : game object already exist with name: "+newName);
		}

		this.gos[newName] = this.gos[oldName];

		this.removeGO(oldName);
	},

	getName : function(inst){
		var key;
		for(key in this.gos){
			if(this.gos[key] == inst){
				return key;
			}
		}
		return false;
	},
	
	removeGO2 : function(inst){
		var key;
		for(key in this.gos){
			if(this.gos[key] == inst){
				this.removeGO(key);
			}
		}
	},
	
	createInstance : function (objectClass,layer,x,y){
		var inst = this.runtime.CreateInstance(this.runtime.GetObjectClassByName(objectClass),layer,x,y);
		const b = this.runtime.GetEventSheetManager();
		b.BlockFlushingInstances(!0);
		//inst._TriggerOnCreated();
		b.BlockFlushingInstances(!1);
		//
		/*if(!noSOLChange){
			objectClass.GetCurrentSol().SetSinglePicked(inst);
		}*/
			
		return inst;
	},
	
	clone : function (template,name,parent,layer, x, y,onNodeCreated){
		if(this.gos[name]){
			console.error("Aekiro GameObject: GameObject already exist with name: %s !",name);
			return;
		}
		
		if (typeof parent === 'string'){
			parent = this.gos[parent];	
		}
		
		//the x,y are global and _clone expect locals, so transform xy into locals in parent space
		if(parent){
			var wp = parent.GetWorldInfo();
			var res = this.globalToLocal3(x,y,0,wp.GetX(),wp.GetY(),wp.GetAngle());
			x = res.x;
			y = res.y;
		}
		
		var inst = this._clone(template,name,parent,layer,x,y,onNodeCreated);
		
		inst.GetUnsavedDataMap().aekiro_gameobject.children_update();
		inst.GetUnsavedDataMap().aekiro_gameobject.updateZindex();
		
		var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
		aekiro_gameobject.eventManager.emit("cloned");
		
		return inst;
	},
	
	_clone : function (t_node,name,parent,layer, x, y, onNodeCreated){
		//haltNext is used to skip addGo() executed on the instance creation
		this.haltNext = true;
		var inst = this.createInstance(t_node.type, layer);
		this.haltNext = false;

		var b;
        try {
            b = JSON.parse(t_node.json);
        } catch (a) {
            return void console.error("Failed to load from JSON string: ", a);
        }
		inst.LoadFromJson(b,!0);
		
		
		
		var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
		//aekiro_gameobject.eventManager.emit("cloned");
		
		inst.GetUnsavedDataMap().zindex = t_node.zindex;
		inst.GetSdkInstance().CallAction(aekiro_gameobject.acts.MoveToLayer,layer);

		
		aekiro_gameobject.name = "";
		aekiro_gameobject.parentName = "";
		if(name)aekiro_gameobject.name = name;
		this.addGO(inst);
		//aekiro_gameobject.onCreateInit();
		
		if(parent){
			parent.GetUnsavedDataMap().aekiro_gameobject.children_add(inst);
		}
		
		var wi = inst.GetWorldInfo();
		wi.SetX(x,true);
		wi.SetY(y,true);
		wi.SetBboxChanged();
		
		if(onNodeCreated)onNodeCreated(inst);
		
		//we put the trigger after the json state is applied, so that any modif happening in the eventsheet onCreated wont be overrided by the LoadFromJsonString
		inst._TriggerOnCreated();
		
		
		var child;
		for (var i = 0, l= t_node.children.length; i < l; i++) {
			child = t_node.children[i];
			this._clone(child,null,inst, layer, child.x, child.y,onNodeCreated);
		}

		return inst;
	},
	
	globalToLocal3: function(x,y,a,p_x,p_y,p_angle){
		var res = {};
		res.x = (x-p_x)*Math.cos(p_angle) + (y-p_y)*Math.sin(p_angle);
		res.y = -(x-p_x)*Math.sin(p_angle) + (y-p_y)*Math.cos(p_angle);
		res.angle = a - p_angle;
		return res;
	},
	
	registerGameObjects : function(){
		var aekiro_gameobjectBehaviorBase = this.runtime._pluginManager._behaviorsByCtor.get(C3.Behaviors.aekiro_gameobject);
		if(!aekiro_gameobjectBehaviorBase) return;
		
		var insts = aekiro_gameobjectBehaviorBase.GetInstances();
		var l = insts.length;
		for (var i = 0; i < l; i++){
			//we check for IsDestroyed: somehow when objects on a global layer get destroyed and recreated going from layer to another
			if(!insts[i].IsDestroyed()){
				this.addGO(insts[i]);	
			}
		}
	},

	createSceneGraph:function(){
		//console.log(this.gos);		
		var key, go, aekiro_gameobject;
		var parentSameLayer = {};
		for(key in this.gos){
			go = this.gos[key];
			aekiro_gameobject = go.GetUnsavedDataMap().aekiro_gameobject;
			if(aekiro_gameobject.parentName && this.gos[aekiro_gameobject.parentName]){
				this.gos[aekiro_gameobject.parentName].GetUnsavedDataMap().aekiro_gameobject.children_add(go);
			}
			if(aekiro_gameobject.parentSameLayer){
				parentSameLayer[key] = go;
			}
		}
		
		for(key in parentSameLayer){
			go = parentSameLayer[key];
			aekiro_gameobject = go.GetUnsavedDataMap().aekiro_gameobject;
			aekiro_gameobject.children_addFromLayer(aekiro_gameobject.GetWorldInfo().GetLayer());
		}
		
		//the onCreated trigger is executed before the children_register; so when a modif is applied to the parent on the trigger, the chidlren dont get updated
		for(key in this.gos){
			this.gos[key].GetUnsavedDataMap().aekiro_gameobject.children_update();
		}
		
		//console.log("childrenRegistred");
		this.eventManager.emit("childrenRegistred");
	},
	
	cleanSceneGraph : function(){
		var key, inst;
		for(key in this.gos){
			inst = this.gos[key];
			inst.GetUnsavedDataMap().aekiro_gameobject.removeFromParent();
		}
	}

};



globalThis.Aekiro.button = class aekiro_button extends C3.SDKBehaviorInstanceBase
{
	constructor(behInst,properties)
	{
		super(behInst);
	}

	button_constructor()
	{

		this.proui = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
		if(this.proui){
			this.proui = this.proui.GetSingleGlobalInstance().GetSdkInstance();
		}
		this.proui.isTypeValid(this.GetObjectInstance(),[C3.Plugins.Sprite,C3.Plugins.NinePatch,C3.Plugins.TiledBg],"Pro UI: Button behavior is only applicable to Sprite, 9-patch or tiled backgrounds objects.");
		
		this.inst = this.GetObjectInstance();
		this.wi = this.inst.GetWorldInfo();
		this.goManager = globalThis.aekiro_goManager;
		this.scrollViews = globalThis.aekiro_scrollViewManager.scrollViews;
		this.aekiro_dialogManager = globalThis.aekiro_dialogManager;
		this.GetObjectInstance().GetUnsavedDataMap().aekiro_button = this;
		//*********************************
		this.isInstanceOfSprite = this.GetObjectInstance().GetPlugin().constructor == C3.Plugins.Sprite;
		this.STATES = {NORMAL:0, HOVER:1, CLICKED:2 , DISABLED:3, FOCUSED:4};
		this.isOnMobile = C3.Platform.IsMobile;
		this.isTouchStarted = false;
		this.isMouseEnter = false;
		this.isFocused = false;
		this.callbacks = [];
		this.frameAnim = [];
		this.initProps = {
			animationFrame : null,
			animationName : null,
			color: null
		};
		
		this.startClick = {x:0,y:0};
		
		//console.log("constructor aekiro_buttonB");
	}
	
	PostCreate(){
		this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
		this.sdkInstance = this.GetObjectInstance().GetSdkInstance();
		this.sdkInstance_callAction = this.sdkInstance.CallAction;
		this.sdkInstance_callExpression = this.sdkInstance.CallExpression;
		this.sdkInstance_acts = this.GetObjectInstance().GetPlugin().constructor.Acts;
		this.sdkInstance_exps = this.GetObjectInstance().GetPlugin().constructor.Exps;

		/*if(this.goManager.haltNext)return;//this is mainly to avoid calling the following when cloning, because it's get called before LoadFromJson
		
		this.updateView();*/
		
		this.onPropsLoaded();
		this.updateViewTick();
		//console.log("PostCreate aekiro_buttonB ***");
	}
	
	//anything that's computed based on the instance props goes here
	onPropsLoaded(){
		this.useStates = true;
		if(!this.isInstanceOfSprite || 
		(this.frame_normal=="" && this.frame_hover=="" && this.frame_clicked=="" && this.frame_disabled=="")){
			this.useStates = false;
		}
		
		this.state = this.isEnabled? this.STATES.NORMAL:this.STATES.DISABLED; //this.state is computed here 
		this.setInitProps();
		this.initSounds();
		this.initFrameAnim();
		this.initAnimations();
		this.initColors();
	}
	
	//
	onInitPropsLoaded(){
		var t = this.initProps.color;
		this.initProps.color  = new C3.Color();
		this.initProps.color.setFromJSON(t);
	}
	
	updateView(){
		this.setFrameAnim(this.state);
		this.setColor(this.state);
	}
	
	updateViewTick(){
		this.updateV = true;
		this._StartTicking();
	}
	
	setEnabled(isEnabled){
		if(this.isEnabled == isEnabled)return;

		this.isEnabled = isEnabled;
		this.state = isEnabled? this.STATES.NORMAL:this.STATES.DISABLED;
		this.setFrameAnim(this.state);
		this.setColor(this.state);
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
	
	parseColor(color,defaultColor){
		if(color){
			color = color.split(",");
			color = new C3.Color(color[0]/255, color[1]/255, color[2]/255,1);
		}else{
			if(defaultColor !== undefined){
				color = defaultColor;
			}else{
				color = this.initProps.color;
			}
		}
		return color;
	}
	
	initSounds(){
		var map = this.GetObjectInstance().GetUnsavedDataMap();
		if(!map.audioSources){
			map.audioSources = {};
		}
		var AudioSource = globalThis.AudioSource;

		this.audioSources = map.audioSources;
		this.audioSources.click = new AudioSource(this.clickSound,this.GetRuntime());
		this.audioSources.hover = new AudioSource(this.hoverSound,this.GetRuntime());
		this.audioSources.focus = new AudioSource(this.focusSound,this.GetRuntime());	
	}
	
	initColors(){
		this.colors = [];
		
		this.colors[this.STATES.NORMAL] = this.parseColor(this.color_normal);
		this.colors[this.STATES.HOVER] = this.parseColor(this.color_hover, null);
		this.colors[this.STATES.CLICKED] = this.parseColor(this.color_clicked, null);
		this.colors[this.STATES.DISABLED] = this.parseColor(this.color_disabled);
		this.colors[this.STATES.FOCUSED] = this.parseColor(this.color_focus,null);
		//console.log(this.colors);
	}

	setColor(state){
		var color;
		if(this.isFocused){
			if(this.state == this.STATES.NORMAL){
				color = this.colors[this.STATES.FOCUSED] || this.colors[this.STATES.NORMAL];
			}else{
				color = this.colors[state] || this.colors[this.STATES.FOCUSED];

				if(!this.colors[state] && !this.colors[this.STATES.FOCUSED]){
					color = this.colors[this.STATES.NORMAL];
				}
			}
		}else{
			color = this.colors[state];
		}
		
		if(color){
			this.wi.SetUnpremultipliedColor(color);
			this.wi.SetBboxChanged();
		}
	}
	
	setInitProps(){
		if(this.isInstanceOfSprite){
			this.initProps.animationFrame = this.initProps.animationFrame===null?this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationFrame):this.initProps.animationFrame;
			this.initProps.animationName = this.initProps.animationName || this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationName);	
		}

		this.initProps.color = this.initProps.color || this.wi.GetUnpremultipliedColor();
		//console.log(this.initProps);
	}
	

	initFrameAnim(){
		if(!this.useStates)return;
		//console.log(this.initProps.animationName);
		this.frameAnim[this.STATES.NORMAL] = this.parseFrameAnim(this.frame_normal);
		this.frameAnim[this.STATES.HOVER] = this.parseFrameAnim(this.frame_hover, {"f": null,"a": null});
		this.frameAnim[this.STATES.CLICKED] = this.parseFrameAnim(this.frame_clicked, {"f": null,"a": null});
		this.frameAnim[this.STATES.DISABLED] = this.parseFrameAnim(this.frame_disabled);
		this.frameAnim[this.STATES.FOCUSED] = this.parseFrameAnim(this.frame_focus,{"f": null,"a": null});

		//console.log("%o",this.frameAnim);
	}
	
	setFrameAnim(state){
		if(!this.useStates){
			return;
		}
		
		var frame, anim;
		if(this.isFocused){
			if(this.state == this.STATES.NORMAL){
				frame = (this.frameAnim[this.STATES.FOCUSED]["f"]===null)?this.frameAnim[this.STATES.NORMAL]["f"]:this.frameAnim[this.STATES.FOCUSED]["f"];
				anim = this.frameAnim[this.STATES.FOCUSED]["a"] || this.frameAnim[this.STATES.NORMAL]["a"] ;
			}else{
				if(this.frameAnim[state]["f"] == null && !this.frameAnim[state]["a"] ){
					frame = this.frameAnim[this.STATES.NORMAL]["f"];
					anim = this.frameAnim[this.STATES.NORMAL]["a"];
				}else{
					frame = (this.frameAnim[state]["f"]===null)?this.frameAnim[this.STATES.FOCUSED]["f"]:this.frameAnim[state]["f"];
					anim = this.frameAnim[state]["a"] || this.frameAnim[this.STATES.FOCUSED]["a"];				
				}

			}
		}else{
			frame = this.frameAnim[state]["f"];
			anim = this.frameAnim[state]["a"];
		}
		
		//console.log(frame,anim);
		
		if(anim){
			this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnim,anim,0);
		}
		if(frame !== null){
			this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnimFrame,frame,0);
		}
	}
	
	initAnimations(){
		this.currentDelta = {x:0, y:0, width:0, height:0};
		this.targetDelta = {x:0, y:0, width:0, height:0};
		
		this.tween = new Tween["Tween"](this.currentDelta);
	}

	setAnimations(type){
		//None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right
		this.prev = {x : this.currentDelta.x, y : this.currentDelta.y ,width : this.currentDelta.width, height : this.currentDelta.height};

		if(type == 1){
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 200);
		}else if(type == 2){
			this.tween["easing"](Tween["Easing"]["Elastic"]["Out"])["to"](this.targetDelta, 500);
		}else if(type == 3){
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 100);
		}else if(type == 4){
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 100);
		}else if(type == 5){
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 100);
		}else if(type == 6){
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 100);
		}
	}
	
	getTargetDelta(type,state){
		//None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right
		var wi = this.wi;
		var t  = {x:0, y:0, width:0, height:0};
		var f = 0.1;
		if(state == "click"){
			f = this.clickAnimationFactor;
		}else if(state == "hover"){
			f = this.hoverAnimationFactor;
		}else if(state == "focus"){
			f = this.focusAnimationFactor;
		}
		
		if(type == 1 || type == 2){
			t.width = wi.GetWidth()*f;
			t.height = wi.GetHeight()*f;
		}else if(type == 3){
			t.y = wi.GetHeight()*f;
		}else if(type == 4){
			t.y = -wi.GetHeight()*f;
		}else if(type == 5){
			t.x = -wi.GetWidth()*f;
		}else if(type == 6){
			t.x = wi.GetWidth()*f;
		}
		
		return t;
	}
		
	//**************************
	OnAnyInputDown(x, y) {
		//console.log("_OnInputDown"+x+"***"+y+"***"+source);		
		if (this.wi.ContainsPoint(x, y)){
			this.OnInputDown(x,y);
		}
	}
	
	OnAnyInputMove(x, y) {
		if(this.isOnMobile)return;

		if (this.wi.ContainsPoint(x, y)){
			if(!this.isMouseEnter){
				this.OnMouseEnter(x, y);
			}
		}else{
			if(this.isMouseEnter){
				this.OnMouseLeave();
			}
		}
		//console.log("_OnMove"+x+"***"+y);
	}
	
	setFocused(isFocused){
		if(!this.isEnabled)return;
		
		if(isFocused == this.isFocused)return;
		
		this.isFocused = isFocused;

		/*var x = this.wi.GetBoundingBox().getLeft()+10;
		var y = this.wi.GetBoundingBox().getTop()+10;
		if(!this.isClickable(x,y))return;*/
		
		if(isFocused){	
			this.setFrameAnim(this.state);
			this.setColor(this.state);
			this.audioSources.focus.play();
			
			if(this.focusAnimation>0){
				this.tween["stop"]();
				this.targetDelta_focus = this.getTargetDelta(this.focusAnimation,"focus");
				this.targetDelta.width += this.targetDelta_focus.width;
				this.targetDelta.height += this.targetDelta_focus.height;
				this.targetDelta.x += this.targetDelta_focus.x;
				this.targetDelta.y += this.targetDelta_focus.y;

				this.setAnimations(this.focusAnimation);;
				this._StartTicking();
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);
			}

			if(this.OnFocusedC)this.OnFocusedC();
		}else{
			//reset to normal
			this.setFrameAnim(this.STATES.NORMAL);
			this.setColor(this.STATES.NORMAL);
			//reapply the current state
			this.setFrameAnim(this.state);
			this.setColor(this.state);
			
			if(this.focusAnimation>0){
				this.tween["stop"]();
				this.targetDelta.width -= this.targetDelta_focus.width;
				this.targetDelta.height -= this.targetDelta_focus.height;
				this.targetDelta.x -= this.targetDelta_focus.x;
				this.targetDelta.y -= this.targetDelta_focus.y;

				this.setAnimations(this.focusAnimation);
				this._StartTicking();
				this.tween["start"](this.GetRuntime().GetWallTime()*1000);			
			}

			if(this.OnUnFocusedC)this.OnUnFocusedC();

		}
	}
	
	OnMouseEnter(x, y) {
		if(!this.isClickable(x,y))return;
		
		if(this.isTouchStarted)return;
		
		this.isMouseEnter = true;
		
		this.state = this.STATES.HOVER;
		this.setFrameAnim(this.state);
		this.setColor(this.state);	
		this.audioSources.hover.play();
		if(this.OnMouseEnterC)this.OnMouseEnterC();
		
		//Play the onhover Animation
		if(this.hoverAnimation>0){
			var wi = this.wi;
			this.tween["stop"]();
			//reset
			/*this.wi.SetSize(wi.GetWidth() - this.currentDelta.width, wi.GetHeight() - this.currentDelta.height);
			this.wi.OffsetXY(-this.currentDelta.x, -this.currentDelta.y);
			this.wi.SetBboxChanged();
			for(var i in this.currentDelta) this.currentDelta[i] = 0;*/
			
			this.targetDelta_hover = this.getTargetDelta(this.hoverAnimation,"hover");
			this.targetDelta.width += this.targetDelta_hover.width;
			this.targetDelta.height += this.targetDelta_hover.height;
			this.targetDelta.x += this.targetDelta_hover.x;
			this.targetDelta.y += this.targetDelta_hover.y;
			this.setAnimations(this.hoverAnimation);
			this._StartTicking();
			this.tween["start"](this.GetRuntime().GetWallTime()*1000);
		}

		//console.log("ProUI-Button uid=%s: On Mouse Enter",this.inst.uid);
	}
	
	async OnInputDown(x, y) {
		/*var res = await this.isOnMovingScrollView();
		if(res)return;*/
		
		//console.log("_OnInputDown"+x+"***"+y);
		//Ignore if the button is already being clicked, or not clickable
		if(!this.isClickable(x,y) || this.isTouchStarted)return;

		this.isTouchStarted = true;

		this.startClick.x = x;
		this.startClick.y = y;

		//Play the onclick Animation
		if(this.clickAnimation>0){
			this.tween["stop"]();
			
			this.targetDelta_click = this.getTargetDelta(this.clickAnimation,"click");
			this.targetDelta.width += this.targetDelta_click.width;
			this.targetDelta.height += this.targetDelta_click.height;
			this.targetDelta.x += this.targetDelta_click.x;
			this.targetDelta.y += this.targetDelta_click.y;
			
			this.setAnimations(this.clickAnimation);
			this._StartTicking();
			this.tween["start"](this.GetRuntime().GetWallTime()*1000);
		}
		
		//focus
		if(!this.isFocused && this.focusAnimation>0){ //play the focus anim one time
			this.tween["stop"]();
			this.targetDelta_focus = this.getTargetDelta(this.focusAnimation,"focus");
			this.targetDelta.width += this.targetDelta_focus.width;
			this.targetDelta.height += this.targetDelta_focus.height;
			this.targetDelta.x += this.targetDelta_focus.x;
			this.targetDelta.y += this.targetDelta_focus.y;

			this.setAnimations(this.focusAnimation);
			this._StartTicking();
			this.tween["start"](this.GetRuntime().GetWallTime()*1000);
		}

		if(!this.isFocused){ 
			if(this.OnFocusedC)this.OnFocusedC();
		}
		
		this.isFocused = true;
		this.state = this.STATES.CLICKED;
		this.setFrameAnim(this.state);
		this.setColor(this.state);
		this.audioSources.click.play();
			
	}
	
	async OnAnyInputUp(x, y) {
		//console.log("_OnInputUP"+x+"***"+y+"***"+source);
		if(!this.isTouchStarted)return;
		
		this.isTouchStarted = false;


		
		if(this.clickAnimation>0 && this.state!=this.STATES.NORMAL){			
			this.tween["stop"]();
			this.targetDelta.width -= this.targetDelta_click.width;
			this.targetDelta.height -= this.targetDelta_click.height;
			this.targetDelta.x -= this.targetDelta_click.x;
			this.targetDelta.y -= this.targetDelta_click.y;
			
			this.setAnimations(this.clickAnimation);
			this._StartTicking();
			this.tween["start"](this.GetRuntime().GetWallTime()*1000);
		}
		
		if(this.wi.ContainsPoint(x,y)){
			if(this.isOnMobile){ //on mobile
				this.state = this.STATES.NORMAL; //if isfocused
			}else{
				this.state = this.STATES.HOVER;
			}
			if(this.isOnScrollView() && (Math.abs(this.startClick.x-x)>10 || Math.abs(this.startClick.y-y)>10)){
				//console.log("scroll was moving");
				return;
			}else{
				this.Callbacks();
			}
			
		}else{
			this.state = this.STATES.NORMAL;//if isfocused
		}
		
		this.setFrameAnim(this.state);
		this.setColor(this.state);
	}
	
	Callbacks() {
		//execute programatic callbacks
		for (var i = 0, l= this.callbacks.length; i < l; i++) {
			this.callbacks[i]();
		}
		if(this.OnAnyInputUpC)this.OnAnyInputUpC();
	}

	OnMouseLeave() {
		//console.log("OnMouseLeave");
		this.isMouseEnter = false;
		
		//if the button was disabled on click
		if(this.state!=this.STATES.DISABLED){
			this.state = this.STATES.NORMAL;
		}
		
		this.setFrameAnim(this.state);
		this.setColor(this.state);
		
		if(this.hoverAnimation>0){
			this.targetDelta.width -= this.targetDelta_hover.width;
			this.targetDelta.height -= this.targetDelta_hover.height;
			this.targetDelta.x -= this.targetDelta_hover.x;
			this.targetDelta.y -= this.targetDelta_hover.y;
		}
		if(this.clickAnimation>0 && this.isTouchStarted){
			this.targetDelta.width -= this.targetDelta_click.width;
			this.targetDelta.height -= this.targetDelta_click.height;
			this.targetDelta.x -= this.targetDelta_click.x;
			this.targetDelta.y -= this.targetDelta_click.y;
		}
		if(this.hoverAnimation>0 || (this.clickAnimation>0 && this.isTouchStarted)){
			//for(var i in this.targetDelta) this.targetDelta[i] = 0;
			this.tween["stop"]();
			//this.setAnimations(this.hoverAnimation);
			//this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"]({ x: 0, y: 0,width: 0, height: 0}, 100);
			this.tween["easing"](Tween["Easing"]["Quadratic"]["Out"])["to"](this.targetDelta, 100);
			this._StartTicking();
			this.tween["start"](this.GetRuntime().GetWallTime()*1000);
		}
			
		if(this.OnMouseLeaveC)this.OnMouseLeaveC();
	}

	
	//**************************
	setIgnoreInput(state){
		this.ignoreInput = state;
	}

	Tick(){
	
		if(this.updateV){
			this.updateView();
			this._StopTicking();
			this.updateV = false;
			//console.log("updateV");
			return;
		}
		
		//console.log("tick button");
		if(this.isTweenPlaying){
			this.isTweenPlaying = false;
		}

		if(this.tween["isPlaying"]){
			this.tween["update"](this.GetRuntime().GetWallTime()*1000);
			this.isTweenPlaying = true;
		}

		if(this.isTweenPlaying){
			var wi = this.wi;
			this.wi.OffsetXY(this.currentDelta.x-this.prev.x,this.currentDelta.y-this.prev.y);
			this.wi.SetSize(wi.GetWidth() + this.currentDelta.width-this.prev.width, wi.GetHeight() + this.currentDelta.height-this.prev.height);
			this.wi.SetBboxChanged();
			this.prev = {x : this.currentDelta.x, y : this.currentDelta.y, width : this.currentDelta.width, height : this.currentDelta.height};
		}else{
			this._StopTicking();	
		}
	}
	
	//**************************
	isClickable(x,y){
		if( x === undefined || y === undefined){
			x = this.wi.GetBoundingBox().getLeft()+10;
			y = this.wi.GetBoundingBox().getTop()+10;
		}
		
		if(this.ignoreInput === 1 || this.proui.ignoreInput){
			return false;
		}

		if(this.ignoreInput == 0){
			return true;
		}

		var isVisible = (this.wi.GetLayer().IsVisible() && this.wi.IsVisible());

		var isInsideScrollView = this.isInsideScrollView(x,y);

		var isUnder = false;
		if(this.ignoreInput === 2 && this.aekiro_dialogManager){
			isUnder = this.aekiro_dialogManager.isInstanceUnderModal(this.wi.GetLayer().GetIndex());
		}

		return this.isEnabled && isVisible && !isUnder && isInsideScrollView;
	}
	
	isInsideScrollView(x,y){ 
		//return true;
		var insideScrollView = true;
		var scrollView = this.scrollViews["l"+this.inst.GetWorldInfo().GetLayer().GetIndex()];
		if(scrollView){
			insideScrollView = scrollView.GetWorldInfo().ContainsPoint(x, y);
		}
		return insideScrollView;
	}

	isOnScrollView(){ 
		var onScrollView = true;
		var scrollView = this.scrollViews["l"+this.inst.GetWorldInfo().GetLayer().GetIndex()];
		if(scrollView){
			return true;	
		}else{
			return false;
		}
		
	}

	isOnMovingScrollView(delay) {
		if(delay==undefined)delay = 20;
		var scrollView = this.scrollViews["l"+this.inst.GetWorldInfo().GetLayer().GetIndex()];
		if(scrollView){
			return new Promise(resolve => {	  	
			setTimeout(() => {
				if(scrollView.GetUnsavedDataMap().aekiro_scrollView.isMoving()){
					console.log("moving");
					resolve(true);
				}else{
					resolve(false);
				}
			},delay);
			});
		}else{
		return false;
		}
	}



	Release(){
		super.Release();
	}
	//**************************
	

};

globalThis.Aekiro.button.Cnds = {
	OnMouseEnter(){ return true; },
	OnMouseLeave(){ return true; },
	IsEnabled(){ return this.isEnabled; },

	IsClickable(){ return this.isClickable(); },

	OnFocused(){ return true; },
	OnUnFocused(){ return true; },
	IsFocused(){ return this.isFocused; },

	OnClicked(){ return true; }
};


globalThis.Aekiro.button.Acts = {
	setEnabled(isEnabled){
		this.setEnabled(isEnabled);
	},
	SetFocused(v){
		this.setFocused(v);
	},
	SetIgnoreInput(s){
		this.setIgnoreInput(s);
	},
	SetClickSoundVolume(v){
		this.audioSources.click.setVolume(v);
	},
	SetHoverSoundVolume(v){
		this.audioSources.hover.setVolume(v);
	},
	SimulateClick(){
		if(this.isTouchStarted)return;
		
		var x = this.wi.GetBoundingBox().getLeft()+10;
		var y = this.wi.GetBoundingBox().getTop()+10;
		this.OnInputDown(x,y);
		setTimeout(() => {
			x = this.wi.GetBoundingBox().getLeft()-50;
			y = this.wi.GetBoundingBox().getTop()-50;
			this.OnAnyInputUp(x,y);
			this.Callbacks();
		},100);
	},


	setNormalFrame(v){
		this.frame_normal = v;
		this.initFrameAnim();
		this.setFrameAnim(this.state);
	},
	setHoverFrame(v){
		this.frame_hover = v;
		this.initFrameAnim();
	},
	setClickedFrame(v){
		this.frame_clicked = v;
		this.initFrameAnim();
	},
	setDisabledFrame(v){
		this.frame_disabled = v;
		this.initFrameAnim();
	},
	setFocusFrame(v){
		this.frame_focus = v;
		this.initFrameAnim();
	},

	setClickAnimation(v){
		this.clickAnimation = v;
		this.initAnimations();
	},
	setHoverAnimation(v){
		this.hoverAnimation = v;
		this.initAnimations();
	},
	setFocusAnimation(v){
		this.focusAnimation = v;
		this.initAnimations();
	},
	
	
	setNormalColor(v){
		this.color_normal = v;
		this.initColors();
	},
	setHoverColor(v){
		this.color_hover = v;
		this.initColors();
	},
	setClickedColor(v){
		this.color_clicked = v;
		this.initColors();
	},
	setFocusColor(v){
		this.color_focus = v;
		this.initColors();
	}
};


globalThis.Aekiro.checkbox = class aekiro_checkbox extends globalThis.Aekiro.button
{
	constructor(behInst,properties){
		super(behInst,properties);
	}
	
	checkbox_constructor(){
		this.button_constructor();
		this.frameAnim = [[],[]];
	}

	initFrameAnim(){
		this.useStates = true;
		
		if(!this.isInstanceOfSprite || (this.frame_normal=="" && this.frame_hover=="" && this.frame_disabled=="")){
			this.useStates = false;
			return;
		}
		
		this.cur_AnimationFrame = this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationFrame);
		this.cur_AnimationName = this.sdkInstance.CallExpression(this.sdkInstance_exps.AnimationName);
		
		var f = this.frame_normal.split(',');
		this.frameAnim[0][this.STATES.NORMAL] = this.parseFrameAnim(f[0]);
		this.frameAnim[1][this.STATES.NORMAL] = this.parseFrameAnim(f[1]);

		
		f = this.frame_hover.split(',');
		this.frameAnim[0][this.STATES.HOVER] = this.parseFrameAnim(f[0],{"f": null,"a": null});
		this.frameAnim[1][this.STATES.HOVER] = this.parseFrameAnim(f[1],{"f": null,"a": null});
		
		f = this.frame_disabled.split(',');
		this.frameAnim[0][this.STATES.DISABLED] = this.parseFrameAnim(f[0]);
		this.frameAnim[1][this.STATES.DISABLED] = this.parseFrameAnim(f[1]);
		
		f = this.frame_focus.split(',');
		this.frameAnim[0][this.STATES.FOCUSED] = this.parseFrameAnim(f[0],{"f": null,"a": null});
		this.frameAnim[1][this.STATES.FOCUSED] = this.parseFrameAnim(f[1],{"f": null,"a": null});
		
		//console.log("%o",this.frameAnim[state]);
	}
	
	setFrameAnim(state){
		if(!this.useStates){
			return;
		}
		if(state==this.STATES.CLICKED)state=this.STATES.NORMAL;
		var v = this.value?1:0;
		var frame, anim;
		
		if(this.isFocused){
			if(this.state == this.STATES.NORMAL){
				frame = (this.frameAnim[v][this.STATES.FOCUSED]["f"]===null)?this.frameAnim[v][this.STATES.NORMAL]["f"]:this.frameAnim[v][this.STATES.FOCUSED]["f"];
				anim = this.frameAnim[v][this.STATES.FOCUSED]["a"] || this.frameAnim[v][this.STATES.NORMAL]["a"] ;
			}else{
				if(this.frameAnim[v][state]["f"] == null && !this.frameAnim[v][state]["a"] ){
					frame = this.frameAnim[v][this.STATES.NORMAL]["f"];
					anim = this.frameAnim[v][this.STATES.NORMAL]["a"];
				}else{
					frame = (this.frameAnim[v][state]["f"]===null)?this.frameAnim[v][this.STATES.FOCUSED]["f"]:this.frameAnim[v][state]["f"];
					anim = this.frameAnim[v][state]["a"] || this.frameAnim[v][this.STATES.FOCUSED]["a"];				
				}
			}
		}else{
			frame = this.frameAnim[v][state]["f"];
			anim = this.frameAnim[v][state]["a"];
		}
		
		//console.log(frame,anim);
		
		if(anim){
			this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnim,anim,0);
		}
		if(frame !== null){
			this.sdkInstance.CallAction(this.sdkInstance_acts.SetAnimFrame,frame,0);
		}
	}
	
	initColors(){
		this.cur_color = this.wi.GetUnpremultipliedColor();
		this.colors = [[],[]];
		
		var c;
		c = this.color_normal.split(';');
		this.colors[0][this.STATES.NORMAL] = this.parseColor(c[0]);
		this.colors[1][this.STATES.NORMAL] = this.parseColor(c[1],this.colors[0][this.STATES.NORMAL]);
		
		c = this.color_hover.split(';');
		this.colors[0][this.STATES.HOVER] = this.parseColor(c[0], null);
		this.colors[1][this.STATES.HOVER] = this.parseColor(c[1], this.colors[0][this.STATES.HOVER]);
		
		c = this.color_clicked.split(';');
		this.colors[0][this.STATES.CLICKED] = this.parseColor(c[0], null);
		this.colors[1][this.STATES.CLICKED] = this.parseColor(c[1], this.colors[0][this.STATES.CLICKED]);
		
		c = this.color_disabled.split(';');
		this.colors[0][this.STATES.DISABLED] = this.parseColor(c[0]);
		this.colors[1][this.STATES.DISABLED] = this.parseColor(c[1]),this.colors[0][this.STATES.DISABLED];
		
		c = this.color_focus.split(';');
		this.colors[0][this.STATES.FOCUSED] = this.parseColor(c[0], null);
		this.colors[1][this.STATES.FOCUSED] = this.parseColor(c[1], this.colors[0][this.STATES.FOCUSED]);
		
		//console.log(this.colors);
	}
		
	setColor(state){
		var v = this.value?1:0;
		var color;
		if(this.isFocused){
			if(this.state == this.STATES.NORMAL){
				color = this.colors[v][this.STATES.FOCUSED] || this.colors[v][this.STATES.NORMAL];
			}else{
				color = this.colors[v][state] || this.colors[v][this.STATES.FOCUSED];

				if(!this.colors[v][state] && !this.colors[v][this.STATES.FOCUSED]){
					//color = this.initProps.color;
					color = this.colors[v][this.STATES.NORMAL];
				}
			}
		}else{
			color = this.colors[v][state];
		}
		
		if(color){
			this.wi.SetUnpremultipliedColor(color);
			this.wi.SetBboxChanged();
		}
	}
	
	isValueValid(value){
		if(value == null || value === ""){
			return false;
		}
		return true;			
	}

	setValue(value){
		value = !!value;
		value = value?1:0;
		
		if(this.value!=value){
			this.value = value;
			this.setFrameAnim(this.state);
			this.setColor(this.state);
		}
	}
};


globalThis.aekiro_scrollViewManager = { 
	scrollViews : {},


	add : function(inst){
		this.scrollViews["l"+inst.GetWorldInfo().GetLayer().GetIndex()] = inst;
	},
	
	remove : function(inst){
		for(var key in this.scrollViews){
			if(this.scrollViews[key]==inst){
				delete this.scrollViews[key];
			}
		}
		//delete this.scrollViews["l"+inst.GetWorldInfo().GetLayer().GetIndex()];
	},
	
	//test if inst (a scrollview) overlaps with a scroll on x,y
	isOverlaped : function(inst,x,y){
		var n = inst.GetRuntime().GetMainRunningLayout().GetLayerCount();
		var scrollView;
		var isOverlaped = false;
		for (var i = inst.GetWorldInfo().GetLayer().GetIndex()+1,l = n; i < l; i++) {
			scrollView = this.scrollViews["l"+i];
			if(scrollView){
				if(!scrollView.GetWorldInfo().GetLayer().IsVisible()){
					continue;
				}

				if(scrollView.GetWorldInfo().ContainsPoint(x,y)){
					isOverlaped = true;
					break;
				}
			}

		}
		return isOverlaped;
	}
};


globalThis.aekiro_dialogManager = {
	currentDialogs : [],

	addDialog : function(inst){
		/*if(this.runtime.changelayout && this.currentDialogs_lastResetTick != this.runtime.tickcount){
			//console.log("*** Reseting currentDialogs***");
			this.currentDialogs.length = 0;
			this.currentDialogs_lastResetTick = this.runtime.tickcount;
		}*/
		this.currentDialogs.push(inst);
	},

	removeDialog : function(inst){
		var i = this.currentDialogs.indexOf(inst);
		if(i != -1){
			this.currentDialogs.splice(i, 1);
		}
	},

	isDialogOpened : function(){
		return this.currentDialogs.length;
	},
	isModalDialogOpened : function(){
		for (var i = 0; i < this.currentDialogs.length; i++) {
			if(this.currentDialogs[i].GetUnsavedDataMap().aekiro_dialog.isModal){
				return true;
			}
		}
		return false;
	},
	isInstanceUnder : function(layerIndex){
		for (var i = 0,l=this.currentDialogs.length; i < l; i++) {
			if(layerIndex<this.currentDialogs[i].GetWorldInfo().GetLayer().GetIndex()){
				return true;
			}
		}
		return false;
	},
	isInstanceUnderModal : function(layerIndex){
		var dialog;
		for (var i = 0,l=this.currentDialogs.length; i < l; i++) {
			dialog = this.currentDialogs[i];
			if(layerIndex<dialog.GetWorldInfo().GetLayer().GetIndex() && dialog.GetUnsavedDataMap().aekiro_dialog.isModal){
				return true;
			}
		}
		return false;
	}
};

}