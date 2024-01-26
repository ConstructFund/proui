"use strict";

{
	const C3 = self.C3;
	C3.Plugins.aekiro_translation.Instance = class aekiro_translationSingleGlobalInstance extends C3.SDKInstanceBase
	{
		constructor(inst, properties)
		{
			super(inst);
			
			this.data = {};
		}
		
		setData(data){
			if(typeof data === 'string'){
				try{
					this.data = JSON.parse(data);
				}catch(e){
					console.error("ProUI-Translation: Invalid JSON.");
				}
			}else{
				this.data = data;	
			}
		}
	
		translateAll (lang){
			if(!this.data[lang])return;

			var aekiro_translationBehaviorBase = this.GetRuntime()._pluginManager._behaviorsByCtor.get(C3.Behaviors.aekiro_translationB);
			var insts = aekiro_translationBehaviorBase.GetInstances();

			var key,aekiro_translation,value;
			var l = insts.length; 
			for (var i = 0; i < l; i++){
				aekiro_translation = insts[i].GetUnsavedDataMap().aekiro_translation;
				key = aekiro_translation.key;
				value = self["_"].get(this.data[lang],key);
				if(value!=undefined){
					aekiro_translation.updateView(value);
				}
			}
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
