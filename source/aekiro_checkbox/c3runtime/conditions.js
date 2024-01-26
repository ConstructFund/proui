"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_checkbox.Cnds =
	{
		IsChecked(){ return this.value; }
	};

	Object.assign(C3.Behaviors.aekiro_checkbox.Cnds, globalThis.Aekiro.button.Cnds);
}
