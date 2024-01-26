"use strict";

{
	const C3 = self.C3;
	C3.Plugins.aekiro_proui.Cnds = {
		IsDialogOpened(){ return globalThis.aekiro_dialogManager.isDialogOpened(); }
		,
		OnAnyButtonClicked(){ return true; }
	};
}
