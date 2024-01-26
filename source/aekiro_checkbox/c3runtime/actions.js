"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_checkbox.Acts =
	{
		setValue(value){
			this.setValue(value);
		},
		SetIgnoreInput(s){
			this.setIgnoreInput(s);
		},
		SetClickSoundVolume(v){
			this.audioSources.click.setVolume(v);
		},
		SetHoverSoundVolume(v){
			this.audioSources.hover.setVolume(v);
		}
	};

	Object.assign(C3.Behaviors.aekiro_checkbox.Acts, globalThis.Aekiro.button.Acts);
}
