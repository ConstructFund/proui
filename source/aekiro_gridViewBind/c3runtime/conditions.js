"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gridviewbind.Cnds = {
		IsIndex(index){ return (index == this.index); },
		OnGridViewRender(){ return true; }
	};
}
