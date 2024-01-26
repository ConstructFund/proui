"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gridView.Instance = class aekiro_gridViewInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			this.proui = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
			if(this.proui){
				this.proui = this.proui.GetSingleGlobalInstance().GetSdkInstance();
			}
			
			//properties
			if (properties){
				this.itemName = properties[0];
				this.columns = properties[1];
				this.rows = properties[2];
				this.vspace = properties[3];
				this.hspace = properties[4];
				this.VPadding  = properties[5];
				this.HPadding = properties[6];
			}
	
			//********************
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_gridview = this;
			this.inst = this.GetObjectInstance();
			this.wi = this.GetWorldInfo();
			this.acts = this.GetObjectInstance().GetPlugin().constructor.Acts;
			this.goManager = globalThis.aekiro_goManager;
			//********************
			this.template = {};
			this.isTemplateSet = false;
	
			this.value = [];
			this.items = [];
			this.it_column = 0; //column iterator
			this.it_row = 0; //row iterator
			
			
			this.goManager.eventManager.on("childrenRegistred",() =>{
				var children = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject.children;
				for (var i = 0, l= children.length; i < l; i++) {
					this.items.push(children[i]);
				}
			},{"once":true}); 	
			
		}
	
		
		PostCreate(){
			this.aekiro_gameobject = this.GetObjectInstance().GetUnsavedDataMap().aekiro_gameobject;
		}
		
		setItemTemplate (){
			if(this.isTemplateSet){
				return;
			}
			
			var item = this.goManager.gos[this.itemName];
			if(!item){
				throw new Error("ProUI-GRIDVIEW: Grid item not found, please check the grid item's name");
				return;
			}
			this.proui.isTypeValid(this.GetObjectInstance(),[C3.Plugins.Sprite,C3.Plugins.NinePatch,C3.Plugins.TiledBg],"ProUI-GRIDVIEW: Grid item can only be Sprite, 9-patch or tiled backgrounds objects.");
			var go = item.GetUnsavedDataMap().aekiro_gameobject;
			this.template = go.getTemplate();//console.log(this.template);
			go.destroyHierarchy();
			
			this.isTemplateSet = true;
		}
		
		getDataLength (){
			if(this.isArray(this.value)){
				return this.value.length;
			}else{
				return Object.keys(this.value).length;
			}
		}
		
		build (){
			if(this.rows<=0 && this.columns<=0){
				console.error("ProUI-GRIDVIEW: max rows and max columns can't be both -1 or 0");
				return;
			}
	
			this.setItemTemplate();
			const dataLength = this.getDataLength();
			var diff = dataLength - this.items.length;
			//console.log(diff);
			//console.log("%cGRIDVIEW %d : Build","color:blue", this.inst.uid);
			var item, l;
			if(diff>0){
				l = dataLength;
				for (var i = this.items.length; i < l ; i++) {
					item = this.add(i);
					if(!this.nextRowColumn()){
						break;
					}
				}
				
			}else if(diff<0){
				l = this.items.length;
				for (var i = dataLength; i < l ; i++) {
					this.items[i].GetUnsavedDataMap().aekiro_gameobject.destroyHierarchy();
					if(!this.previousRowColumn()){
						break;
					}
				}
				this.items.splice(dataLength,-diff);
			}
			this.resize();
			
			if(this.isArray(this.value)){
				l = dataLength;
				for (var i = 0; i < l ; i++) {
					this.mapData(this.items[i],this.value[i],i);
				}
			}else{
				var i = 0;
				for (const key in this.value) {
					this.mapData(this.items[i],this.value[key],i,key);
					i++;
				}			
			}

			

	
			var self = this;
			setTimeout(function(){
				self.Trigger(C3.Behaviors.aekiro_gridView.Cnds.OnRender);
			},0);
			
		}
	
		add (itemIndex){
			//console.log("%cGRIDVIEW %d : Add item %d","color:blue", this.inst.uid,itemIndex);
	
			var self = this;
			var item = this.goManager.clone(this.template,null,this.inst,this.wi.GetLayer(),0,0);
			
			var wi  = item.GetWorldInfo();
			var offsetX = wi.GetX() - wi.GetBoundingBox().getLeft();
			var offsetY = wi.GetY() - wi.GetBoundingBox().getTop();
			wi.SetX(this.wi.GetBoundingBox().getLeft() + offsetX + (this.vspace + wi.GetWidth())*this.it_column + this.HPadding);
			wi.SetY(this.wi.GetBoundingBox().getTop() + offsetY + (this.hspace + wi.GetHeight())*this.it_row + this.VPadding);
			wi.SetBboxChanged();
			
			
			this.items.push(item);
	
			//if(this.onAdd)this.onAdd(item);
	
			return item;
		}
		
		clear (){
			//in case the template is not set yet
			this.setItemTemplate();

			//console.log("%cGRIDVIEW %d : Clear","color:blue", this.inst.uid);
			var items = this.items;
			for (var i = 0,l=this.items.length; i < l; i++) {
				items[i].GetUnsavedDataMap().aekiro_gameobject.destroyHierarchy();
			}
			items.length = 0;
			this.it_column = 0; //column iterator
			this.it_row = 0; //row iterator
			
			this.value = [];
			//Resizing and repositioning
			this.resize();
		}
		
		resize (){
			var wi = this.wi;
			
			//save current position
			var prevBboxTop = wi.GetBoundingBox().getTop();
			var prevBboxLeft = wi.GetBoundingBox().getLeft();
			var prevX = wi.GetX();
			var prevY = wi.GetY();
			
			const dataLength = this.getDataLength();
			
			if(dataLength==0){
				wi.SetWidth(5,true);
				wi.SetHeight(5,true);
				wi.SetBboxChanged();
				
				wi.SetX(prevBboxLeft + (wi.GetX()-wi.GetBoundingBox().getLeft()));
				wi.SetY(prevBboxTop + (wi.GetY()-wi.GetBoundingBox().getTop()));
				wi.SetBboxChanged();
				return;	
			}
	
			//console.log("%cGRIDVIEW %d : Content Resize","color:blue", this.inst.uid);
			var row = Math.ceil(dataLength/this.columns);
			var column = Math.ceil(dataLength/this.rows);
			
			if(this.rows<0){
				column = this.columns;
				if(dataLength < this.columns){
					column = dataLength;
				}
			}else if(this.columns<0){
				row = this.rows;
				if(dataLength < this.rows){
					row = dataLength;
				}
			}else{
				column = this.columns;
				row = this.rows;
			}
	
	
			var itemWidth = this.items[0].GetWorldInfo().GetWidth();
			var itemHeight = this.items[0].GetWorldInfo().GetHeight();
			//Resizing and repositioning
			wi.SetWidth(itemWidth*column+this.vspace*(column-1)+2*this.HPadding,true);
			wi.SetHeight(itemHeight*row+this.hspace*(row-1)+2*this.VPadding,true);
			wi.SetBboxChanged();
			
			//scrollviews listent to size changes, and then reposition the content (the grid), which is overwritten later below, so to avoid that, we check the condition:
			if(wi.GetX()!=prevX || wi.GetX()!=prevY){
				return;
			}
			
			wi.SetX(prevBboxLeft + (wi.GetX()-wi.GetBoundingBox().getLeft()));
			wi.SetY(prevBboxTop + (wi.GetY()-wi.GetBoundingBox().getTop()));
			wi.SetBboxChanged();
		}
	
		mapData (inst,data,index,key){
			if(!inst)return;

			var binder = inst.GetUnsavedDataMap().aekiro_gridviewbind;
			if(binder){  //&& this.isObject(data)
				binder.index = index;
				binder.key = key;
				binder.setValue(data);
				binder.gridView = this;
				binder.triggerOnGridViewRender();
			}
			
			var children = inst.GetUnsavedDataMap().aekiro_gameobject.children;
			for (var i = 0,l=children.length; i < l; i++) {
				this.mapData(children[i],data,index,key);
			}	
		}
	
		item_setKey (i,key,value){
			//self["_"]["set"](this.value[i],key,value);
			//console.log(this.value);
		}
	
		nextRowColumn (){
			if(this.rows<0){
				this.it_column++;
				if(this.it_column == this.columns){
					this.it_column = 0;
					this.it_row++;
				}
			}else if(this.columns<0){
				this.it_row++;
				if(this.it_row == this.rows){
					this.it_row = 0;
					this.it_column++;
				}
			}else{
				this.it_column++;
				if(this.it_column == this.columns){
					this.it_column = 0;
					this.it_row++;
				}
				if(this.it_row  == this.rows)
					return false;
			}
	
			return true;
		}
	
		previousRowColumn (){
			if(this.rows<0){
				this.it_column--;
				if(this.it_column < 0){
					this.it_column = this.columns-1;
					this.it_row--;
				}
			}else if(this.columns<0){
				this.it_row--;
				if(this.it_row < 0){
					this.it_row = this.rows-1;
					this.it_column--;
				}
			}else{
				this.it_column--;
				if(this.it_column < 0){
					this.it_column = this.columns-1;
					this.it_row--;
				}
				if(this.it_row == 0)
					return false;
			}
	
			return true;
		}
		
		isObject (a) {
			return (!!a) && (a.constructor === Object);
		}
	
		isArray (a) {
			return (!!a) && (a.constructor === Array);
		}
		
		Release(){
			super.Release();
		}
	
		SaveToJson(){
			return {
				"itemName": this.itemName,
				"columns": this.columns,
				"rows": this.rows,
				"vspace": this.vspace,
				"hspace": this.hspace,
				"VPadding": this.VPadding,
				"HPadding": this.HPadding,
				
				"template" : this.template,
				"isTemplateSet" : this.isTemplateSet,
				"value" : this.value,
				"it_column" : this.it_column,
				"it_row" : this.it_row
			};
		}
	
		LoadFromJson(o){
			this.itemName = o["itemName"];
			this.columns = o["columns"];
			this.rows = o["rows"];
			this.vspace = o["vspace"];
			this.hspace = o["hspace"];
			this.VPadding  = o["VPadding"];
			this.HPadding = o["HPadding"];
			
			this.template = o["template"];
			this.isTemplateSet = o["isTemplateSet"];
			this.value = o["value"];
			this.it_column = o["it_column"];
			this.it_row = o["it_row"];
		}
	};
	
}