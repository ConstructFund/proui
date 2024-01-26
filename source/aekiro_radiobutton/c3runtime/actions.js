"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_radiobutton.Acts = {
		SetIgnoreInput(s){
			this.setIgnoreInput(s);
		},
		SetClickSoundVolume(v){
			this.audioSources.click.setVolume(v);
		},
		SetHoverSoundVolume(v){
			this.audioSources.hover.setVolume(v);
		},
		SetName(v){
			this.name = v;
		}
	};
	Object.assign(C3.Behaviors.aekiro_radiobutton.Acts, globalThis.Aekiro.button.Acts);
}
