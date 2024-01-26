"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_dialog.Cnds = {
		onDialogOpened(){ return true; },
		onDialogClosed(){ return true; },
		isOpened(){ return this.isOpen; }
	};
	
}
