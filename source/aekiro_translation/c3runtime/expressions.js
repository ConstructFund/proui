"use strict";

{
	const C3 = self.C3;
	C3.Plugins.aekiro_translation.Exps =
	{
		get(key,lang){
			var res  = self["_"].get(this.data[lang],key);
			return res;
		}
	};
	
}
