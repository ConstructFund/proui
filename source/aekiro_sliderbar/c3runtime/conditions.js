"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_sliderbar.Cnds = {
		IsSliding(){ return this.isSliding; },
		
		OnChanged(){ return true; }
	};
}
