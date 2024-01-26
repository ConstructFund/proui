"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_progress.Acts =
	{
		setValue(value,animation){
			this.animation = animation;
			this.setValue(value);
		},

		SetMaxValue(v){
			this.setMaxValue(v);
		}
	};
}
