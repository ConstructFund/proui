"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_dialog.Acts = {
		Open(targetX,targetY,isCentered){
			this.open(targetX,targetY,isCentered);
		},
		Close(){
			this.close();
		},
		SetOpenSoundVolume(v){
			this.audioSources.open.setVolume(v);
		},
		SetCloseSoundVolume(v){
			this.audioSources.close.setVolume(v);
		}
	};
}
