"use strict";

{
	const C3 = self.C3;
	C3.Plugins.aekiro_proui.Acts = {
		SetInputIgnored(state){
			this.ignoreInput = state;
		},
		Clone(json,layer,x,y,name,parentName){
			json = JSON.parse(json);
			var inst = globalThis.aekiro_goManager.clone(json,name,parentName,layer,x,y);
			inst.GetUnsavedDataMap().aekiro_gameobject.updateZindex();
		},
		SetUIAudioVolume(v){
			this.setUIAudioVolume(v);
		},
		Init(){
			this.Initialise();
		}
	};
}
