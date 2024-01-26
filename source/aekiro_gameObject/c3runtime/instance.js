"use strict";
{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gameobject.Instance = class MyBehaviorInstance extends C3.SDKBehaviorInstanceBase {
		constructor(behInst, properties)
		{
			super(behInst);
	
			//properties
			if (properties){
				this.name = properties[0];
				this.parentName = properties[1];
				this.parentSameLayer = properties[2];
			}
	
			//********************
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject = this;
			this.inst = this.GetObjectInstance();
			this.wi = this.GetWorldInfo();
			this.acts = this.GetObjectInstance().GetPlugin().constructor.Acts;
			this.eventManager = new globalThis.EventManager(this.inst);
			this.goManager = globalThis.aekiro_goManager;

			this.userName = this.name?this.name:null;
			this.areChildrenRegistred = false;
			this.children = [];
			this.parent = null;
			this.local = {
				x : this.wi.GetX(),
				y : this.wi.GetY(),
				angle: this.wi.GetAngle(),
				_sinA: Math.sin(this.wi.GetAngle()),
				_cosA: Math.cos(this.wi.GetAngle())
			};

			this.overrideWorldInfo();
			this.prev = {
				x : this.wi.GetX(),
				y : this.wi.GetY(),
				angle : this.wi.GetAngle(),
				width: this.wi.GetWidth(),
				height: this.wi.GetHeight()
			};
			
			if(this.goManager.isInit){
				this.name = "";
				this.parentName = "";
			}
			this.goManager.addGO(this.inst);
			//console.log("constructor gameobject");
		}
	
	
		PostCreate(){
			//console.log("PostCreate gameobject");
		}
		
		overrideWorldInfo(){
			if(this.isWorldInfoOverrided)return;
			this.isWorldInfoOverrided = true;
			
			var inst = this.GetObjectInstance();
			var wi = inst.GetWorldInfo();
			
			if (!inst.GetUnsavedDataMap().aekiro_gameobject)return;
			
			wi.SetX_old = wi.SetX;
			wi.SetX = function (x,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal && aekiro_gameobject.parent){
					aekiro_gameobject.local.x = x;
					aekiro_gameobject.updateGlobals();
				}else{
					this.SetX_old(x);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			wi.SetY_old = wi.SetY;
			wi.SetY = function (y,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal && aekiro_gameobject.parent){
					aekiro_gameobject.local.y = y;
					aekiro_gameobject.updateGlobals();
				}else{
					this.SetY_old(y);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			wi.SetXY_old = wi.SetXY;
			wi.SetXY = function (x,y,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal && aekiro_gameobject.parent){
					aekiro_gameobject.local.x = x;
					aekiro_gameobject.local.y = y;
					aekiro_gameobject.updateGlobals();
				}else{
					this.SetXY_old(x,y);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			
			wi.OffsetX_old = wi.OffsetX;
			wi.OffsetX = function (x,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal && aekiro_gameobject.parent){
					aekiro_gameobject.local.x += x;
					aekiro_gameobject.updateGlobals();
				}else{
					this.OffsetX_old(x);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			wi.OffsetY_old = wi.OffsetY;
			wi.OffsetY = function (y,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal && aekiro_gameobject.parent){
					aekiro_gameobject.local.y += y;
					aekiro_gameobject.updateGlobals();
				}else{
					this.OffsetY_old(y);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			wi.OffsetXY_old = wi.OffsetXY;
			wi.OffsetXY = function (x,y,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;

				if(isLocal&& aekiro_gameobject.parent){
					aekiro_gameobject.local.x += x;
					aekiro_gameobject.local.y += y;
					aekiro_gameobject.updateGlobals();
				}else{
					this.OffsetXY_old(x,y);
					aekiro_gameobject.updateLocals();
				}
				aekiro_gameobject.children_update();
			};
			
			
			wi.SetAngle_old = wi.SetAngle;
			wi.SetAngle = function (angle,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;
				
				if(isLocal&& aekiro_gameobject.parent){
					aekiro_gameobject.local.angle = angle;
					aekiro_gameobject.local._sinA = Math.sin(angle);
					aekiro_gameobject.local._cosA = Math.cos(angle);
					aekiro_gameobject.updateGlobals();
				}else{
					this.SetAngle_old(angle);
					aekiro_gameobject.updateLocals();
				}	
				aekiro_gameobject.children_update();
			};
			
			wi.OffsetAngle_old = wi.OffsetAngle;
			wi.OffsetAngle = function (angle,isLocal){
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;
				
				if(isLocal&& aekiro_gameobject.parent){
					aekiro_gameobject.local.angle = C3.clampAngle(aekiro_gameobject.local.angle + angle);
					const _a = aekiro_gameobject.local.angle;
					aekiro_gameobject.local._sinA = Math.sin(_a);
					aekiro_gameobject.local._cosA = Math.cos(_a);
					aekiro_gameobject.updateGlobals();
				}else{
					this.OffsetAngle_old(angle);
					aekiro_gameobject.updateLocals();
				}	
				aekiro_gameobject.children_update();
			};
			
			
			wi.GetX_old = wi.GetX;
			wi.GetX = function (isLocal){
				if(isLocal){
					var inst = this.GetInstance();
					var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
					if(aekiro_gameobject.parent){
						return aekiro_gameobject.local.x;
					}
				}
				return this.GetX_old();
			};
			
			wi.GetY_old = wi.GetY;
			wi.GetY = function (isLocal){
				if(isLocal){
					var inst = this.GetInstance();
					var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
					if(aekiro_gameobject.parent){
						return aekiro_gameobject.local.y;
					}
				}
				return this.GetY_old();
			};
			
			wi.GetAngle_old = wi.GetAngle;
			wi.GetAngle = function (isLocal){
				if(isLocal){
					var inst = this.GetInstance();
					var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
					if(aekiro_gameobject.parent){
						return aekiro_gameobject.local.angle;
					}
				}
				return this.GetAngle_old();
			};
			
			wi.GetCosAngle_old = wi.GetCosAngle;
			wi.GetCosAngle = function (isLocal){
				if(isLocal){
					var inst = this.GetInstance();
					var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
					if(aekiro_gameobject.parent){
						return aekiro_gameobject.local._cosA;
					}
				}
				return this.GetCosAngle_old();
			};
			
			
			wi.GetSinAngle_old = wi.GetSinAngle;
			wi.GetSinAngle = function (isLocal){
				if(isLocal){
					var inst = this.GetInstance();
					var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
					if(aekiro_gameobject.parent){
						return aekiro_gameobject.local._sinA;
					}
				}
				return this.GetSinAngle_old();
			};
			
			wi.SetWidth_old = wi.SetWidth;
			wi.SetWidth = function (w,onlyNode){
				if(onlyNode){
					this.SetWidth_old(w);
					return;
				}
				
				var inst = this.GetInstance();
				
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;
	
				w = w==0?0.1:w;
				var f = w/this.GetWidth();
	
				this.SetWidth_old(w);
				var c = aekiro_gameobject.children;
				var l = c.length;
				for (var i = 0, l; i < l; i++) {
					wi = c[i].GetWorldInfo();
					wi.SetX(wi.GetX(true)*f,true); // this need to be first
					wi.SetWidth(wi.GetWidth()*f);
					wi.SetBboxChanged();
				}
			};
			
			wi.SetHeight_old = wi.SetHeight;
			wi.SetHeight = function (h,onlyNode){
				if(onlyNode){
					this.SetHeight_old(h);
					return;
				}
				
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;
	
				h = h==0?0.1:h;
				var f = h/this.GetHeight();
	
				this.SetHeight_old(h);
				var c = aekiro_gameobject.children;
				var l = c.length;
				for (var i = 0, l; i < l; i++) {
					wi = c[i].GetWorldInfo();
					wi.SetY(wi.GetY(true)*f,true);// this need to be first
					wi.SetHeight(wi.GetHeight()*f);
					wi.SetBboxChanged();
				}
			};
	
			wi.SetSize_old = wi.SetSize;
			wi.SetSize = function (w,h,onlyNode){
				if(onlyNode){
					this.SetSize_old(w,h);
					return;
				}
				
				var inst = this.GetInstance();
				var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject)return;
				w = w==0?0.1:w;
				h = h==0?0.1:h;
				var fw = h/this.GetHeight();
				var fh = w/this.GetWidth();
	
				this.SetSize_old(w,h);
				var c = aekiro_gameobject.children;
				var l = c.length;
				for (var i = 0, l; i < l; i++) {
					wi = c[i].GetWorldInfo();
					wi.SetX(wi.GetX(true)*fw,true);// this need to be first
					wi.SetY(wi.GetY(true)*fh,true);// this need to be first
					wi.SetSize(wi.GetWidth()*fw,wi.GetHeight()*fh);
					wi.SetBboxChanged();
				}
			};
			
		}
		
		//**********************************************
		
		children_update(){
			if(!this.children.length){
				return;
			}
			var inst,wi,l = this.children.length;
			for (var i = 0; i < l; i++) {
				inst = this.children[i];
				wi = inst.GetWorldInfo();
	
				//updating the child's global coordinates when the parent global coordinates changes.
				wi.SetXY(wi.GetX(true),wi.GetY(true),true);
				wi.SetAngle(wi.GetAngle(true),true);
				wi.SetBboxChanged();
			}
		}
	
		children_add(inst){
			var name,aekiro_gameobject;
			if (typeof inst === 'string'){ //add by child name
				name = inst;
				inst = null;
			}else{
				aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(!aekiro_gameobject){
					console.error("Aekiro GameObject: You're adding a child (uid=%s) without a gameobject behavior on it.",inst.GetUID());
					return;
				}
				name = aekiro_gameobject.name;
			}
	
			//check if gameobject is correctly registred in the gomanager
			inst = this.goManager.gos[name];
			
			if(inst == this.GetObjectInstance()){ //can't add itself
				return;
			}
			
			if(!inst){
				console.error("Aekiro GameObject: Object of name : %s not found !",name);
				return;
			}
			if(name == this.parentName){
				console.error("Aekiro GameObject: Cannot add %s as a child of %s, because %s is its parent !",name,this.name,name);
				return;
			}
			if(this.children.indexOf(inst) > -1){
				console.warn("Aekiro GameObject: Object %s already have a child named %s !",this.name,name);
				return;
			}
	
			aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
			aekiro_gameobject.removeFromParent(); //if inst is already a child of another parent then remove it from its parent.
			aekiro_gameobject.parentName = this.name;
			aekiro_gameobject.parent = this.GetObjectInstance();
			
			var res = this.globalToLocal(inst,this.GetObjectInstance());		
			aekiro_gameobject.local.x = res.x;
			aekiro_gameobject.local.y = res.y;
			aekiro_gameobject.local.angle = res.angle;
			this.children.push(inst);
			
			this.eventManager.emit("childrenAdded",{"args":inst,"propagate":false});
		}
		
		setName(name){

			try{
				this.goManager.setGoName(this.name,name);
			}catch(e){
				console.error(e);
				return;
			}
			
			this.name = name;

			const l = this.children.length;
			for (var i = 0; i < l; i++) {
				this.children[i].GetUnsavedDataMap().aekiro_gameobject.parentName = name;
			}
		}

		//update locals when globals change
		updateLocals(){
			var parent = this.parent_get();
			if(!parent)return;

			if (this.GetObjectInstance()===null)
				return;
				
			var res = this.globalToLocal(this.GetObjectInstance(),parent);		
			this.local.x = res.x;
			this.local.y = res.y;
			this.local.angle = res.angle;
		}
		
		//update globals when locals change
		updateGlobals(){
			var parent = this.parent_get();
			if(!parent)return;
			var res = this.localToGlobal(this.GetObjectInstance(),parent);
			this.wi.SetXY_old(res.x,res.y);
			this.wi.SetAngle_old(res.angle);
		}

		children_addFromLayer (layer){
			var insts = layer._instances;
			var myInst = this.GetObjectInstance();
			var inst,aekiro_gameobject;
			for (var i = 0, l = insts.length; i < l; i++) {
				inst = insts[i];
				aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
				if(inst != myInst && aekiro_gameobject && aekiro_gameobject.parentName==""){
					this.children_add(inst);
				}
			}
		}
		
		children_addFromType (type){
			var insts = type.GetCurrentSol().GetInstances();
			for (var i = 0, l = insts.length; i < l; i++) {
				this.children_add(insts[i]);
			}		
		}
		
		children_remove(inst){
			var index = -1;
			if (typeof inst === 'string'){ //remove by child name
				for (var i = 0, l= this.children.length; i < l; i++) {
					if(this.children[i].GetUnsavedDataMap().aekiro_gameobject.name==inst){
						index = i;
						break;
					}
				}
			}else{
				index = this.children.indexOf(inst);
			}
	
			if(index!=-1){
				var aekiro_gameobject = this.children[index].GetUnsavedDataMap().aekiro_gameobject;
				//aekiro_gameobject.parentName = "";
				aekiro_gameobject.parent = null;
				this.children.splice(index, 1);
				
			}
		}
		
		children_removeFromType (type){
			var insts = type.GetCurrentSol().GetInstances();
			for (var i = 0, l = insts.length; i < l; i++) {
				this.children_remove(insts[i]);
			}		
		}
		
		removeAllChildren(){
			if(!this.children.length)
				return;
			
			var aekiro_gameobject;
			var l = this.children.length;
			for (var i = 0; i < l; i++) {
				aekiro_gameobject = this.children[i].GetUnsavedDataMap().aekiro_gameobject;
				//aekiro_gameobject.parentName = "";
				aekiro_gameobject.parent = null;
			}
			this.children.length = 0;
		}
		
		//**********************************************
	
		removeFromParent(){
			//var parent = this.parent_get();
			var parent = this.parent;
			var inst = this.GetObjectInstance();
			if(parent){
				var aekiro_gameobject = parent.GetUnsavedDataMap().aekiro_gameobject;
				if(aekiro_gameobject){
					aekiro_gameobject.children_remove(inst);
				}
					
			}
		}
		
		destroyHierarchy(){
			var runtime = this.GetRuntime();
			
			runtime.DestroyInstance(this.GetObjectInstance());
			for (var i = 0, l= this.children.length; i < l; i++) {
				this.children[i].GetUnsavedDataMap().aekiro_gameobject.destroyHierarchy()
			}
			this.children.length = 0;
		}
		
		parent_get(){
			if(!this.parent && this.parentName && this.name){
				this.parent = this.goManager.gos[this.parentName];	
			}
			return this.parent;
		}
		
		getTemplate(node){
			if(!node){
				node = this._inst;
			}
			
			var template = {
				type: node.GetObjectClass().GetName(),
				x: node.GetWorldInfo().GetX(true),
				y: node.GetWorldInfo().GetY(true),
				zindex:node.GetWorldInfo().GetZIndex()+node.GetWorldInfo().GetLayer().GetIndex()*100,
				json:JSON.stringify(node.SaveToJson(!0)),
				children:[]
			};
			
	
			var children = node.GetUnsavedDataMap().aekiro_gameobject.children;
			for (var i = 0, l= children.length; i < l; i++) {
				template.children.push(this.getTemplate(children[i]));
			}
	
			return template;
		}
	
		hierarchyToArray(node,ar){
			if(!node){
				node = this.GetObjectInstance();
			}
	
			if(!ar){
				ar = [];
			}
	
			ar.push(node);
	
			var children = node.GetUnsavedDataMap().aekiro_gameobject.children;
			for (var i = 0, l= children.length; i < l; i++) {
				this.hierarchyToArray(children[i],ar);
			}
	
			return ar;
		}
	
		updateZindex(){
			var children = this.hierarchyToArray();
			
			children.sort(function(a, b) {
				return a.GetUnsavedDataMap().zindex - b.GetUnsavedDataMap().zindex;
			});
	
			var layer = children[0].GetWorldInfo().GetLayer();
			//layer.moveInstanceAdjacent(children[0], children[children.length-1], true);
			for (var i = 1, l= children.length; i < l; i++) {
				layer.MoveInstanceAdjacent(children[i], children[i-1], true);
			}
			this.GetRuntime().UpdateRender();
		}

		moveToTop(){
			var children = this.hierarchyToArray();
			children.sort(function(a, b) {
				return a.GetWorldInfo().GetZIndex() - b.GetWorldInfo().GetZIndex();
			});
			for (var i = 0, l= children.length; i < l; i++) {
				children[i].GetSdkInstance().CallAction(this.acts.MoveToTop); 
			}
			this.GetRuntime().UpdateRender();
		}

		moveToBottom(){
			var children = this.hierarchyToArray();
			children.sort(function(a, b) {
				return b.GetWorldInfo().GetZIndex() - a.GetWorldInfo().GetZIndex();
			});
			for (var i = 0, l= children.length; i < l; i++) {
				children[i].GetSdkInstance().CallAction(this.acts.MoveToBottom); 
			}
			this.GetRuntime().UpdateRender();
		}

		setTimeScale(s){
			var children = this.hierarchyToArray();
			
			for (var i = 1, l= children.length; i < l; i++) {
				children[i].SetTimeScale(s);
			}
		}
		
		
	
		Tick(){
		}
	
		Release(){
		}

		Release2(){
			this.goManager.removeGO(this.name);
			this.removeFromParent();
			
			//this is necesserary when a parent have global children that still keep a reference to the parent.
			//when changing layout this reference need to be deleted
			for (var i = 0, l= this.children.length; i < l; i++) {
				this.children_remove(this.children[i]);
			}

			//this.name = "";
			//this.parentName = "";

			super.Release();
		}
		
		SaveToJson(){
			return {
				"name" : this.name,
				"parentName" : this.parentName,
				"parentSameLayer" : this.parentSameLayer,
				"global_x": this.wi.GetX(),
				"global_y": this.wi.GetY()
			};
		}
	
		LoadFromJson(o){
			this.name = o["name"];
			this.parentName = o["parentName"];
			this.parentSameLayer = o["parentSameLayer"];
			
			this.wi.SetXY(o["global_x"],o["global_y"]);
			this.wi.SetBboxChanged();
		}
	
		GetDebuggerProperties(){		
			var children = [];
			for (var i = 0,l=this.children.length; i < l; i++) {
				children.push(this.children[i].GetUnsavedDataMap().aekiro_gameobject.name);
			}
			var children_str = JSON.stringify(children,null,"\t");
	
			/*var objects = [];
			Object.keys(this.goManager.gos).forEach(function(key) {
				objects.push(key);
			});
			var objects_str = JSON.stringify(objects,null,"\t");*/
	
			return [{
				title: "aekiro_gameobject",
				properties: [
					{name: "name", value: this.name},
					{name: "parentName", value: this.parentName},
					{name: "children", value: children_str},
					{name: "local_x", value: this.local.x},
					{name: "local_y",value: this.local.y},
					{name: "local_angle",value: this.local.angle}
					//{name: "gameobjects", value: objects_str}
				]
			}];
		}
		
		//**********************************************
		
		applyActionToHierarchy(action,v){
			if(!action) return;
			
			this.GetObjectInstance().GetSdkInstance().CallAction(action,v);
			var h = this.children;
			var l = h.length;
			for (var i = 0; i < l; i++) {
				h[i].GetUnsavedDataMap().aekiro_gameobject.applyActionToHierarchy(action,v);
			}
		}
		
		SetBlendMode(bm){
			this.wi.SetBlendMode(bm);
			var h = this.children;
			for (var i = 0, l= h.length; i < l; i++) {
				h[i].GetWorldInfo().SetBlendMode(bm);
			}
			
		}
		//**********************************************		
		//transform global coordinates of inst to local coordinates in parent space
		globalToLocal(inst,parent_inst){
			if(!inst || !parent_inst)return;
			var wip = parent_inst.GetWorldInfo();
			return this.globalToLocal2(inst,wip.GetX(),wip.GetY(),wip.GetAngle());
		}
		
		globalToLocal2(inst,p_x,p_y,p_angle){
			if(!inst)return;

			var res = {};
			var wi = inst.GetWorldInfo();
			res.x = (wi.GetX()-p_x)*Math.cos(p_angle) + (wi.GetY()-p_y)*Math.sin(p_angle);
			res.y = -(wi.GetX()-p_x)*Math.sin(p_angle) + (wi.GetY()-p_y)*Math.cos(p_angle);
			res.angle = wi.GetAngle() - p_angle;
			return res;
		}

		localToGlobal(inst,parent_inst){
			if(!inst || !parent_inst)return;
			var wip = parent_inst.GetWorldInfo();
			return this.localToGlobal2(inst,wip.GetX(),wip.GetY(),wip.GetAngle());
		}
		//transform local coordinates of inst in parent space to global coordinates
		localToGlobal2(inst,p_x,p_y,p_angle){
			if(!inst)return;

			var res = {};
			var aekiro_gameobject = inst.GetUnsavedDataMap().aekiro_gameobject;
			res.x = p_x + aekiro_gameobject.local.x*Math.cos(p_angle) - aekiro_gameobject.local.y*Math.sin(p_angle);
			res.y = p_y + aekiro_gameobject.local.x*Math.sin(p_angle) + aekiro_gameobject.local.y*Math.cos(p_angle);
			res.angle = p_angle + aekiro_gameobject.local.angle;
			return res;
		}
	
		localToGlobal_x(){
			var parent = this.parent_get();
			if(parent){
				//console.log(this.GetObjectInstance().GetUID());
				var wp = parent.GetWorldInfo();
				var x = wp.GetX() + this.local.x*Math.cos(wp.GetAngle()) - this.local.y*Math.sin(wp.GetAngle());
				return x;
			}else{
				return this.local.x;
			}
		}
	
		localToGlobal_y(){
			var parent = this.parent_get();
			if(parent){
				var wp = parent.GetWorldInfo();
				var y = wp.GetY() + this.local.x*Math.sin(wp.GetAngle()) + this.local.y*Math.cos(wp.GetAngle());
				return y;
			}else{
				return this.local.y;
			}
		}
		
		localToGlobal_angle(){
			var parent = this.parent_get();
			if(parent){
				var wp = parent.GetWorldInfo();
				var angle = wp.GetAngle() + this.local.angle;
				return angle;
			}else{
				return this.local.angle;
			}
		}
		
	};

	
	
	
	

}




