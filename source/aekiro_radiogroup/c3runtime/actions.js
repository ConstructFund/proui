"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_radiogroup.Acts = {
		setValue(value){
			this.setValue(value);
		},
		setEnabled(isEnabled){
			this.isEnabled = isEnabled;
			for (var i = 0,l=this.radioButtons.length; i < l; i++) {
				this.radioButtons[i].GetUnsavedDataMap().aekiro_radiobutton.setEnabled(isEnabled);
			}
		}
	};
}
