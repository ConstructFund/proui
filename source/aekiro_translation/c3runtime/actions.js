"use strict";

{
	const C3 = self.C3;
	C3.Plugins.aekiro_translation.Acts =
	{
		TranslateAll(lang){
			this.translateAll(lang);
		},
		
		SetDataByJsonString(JSON){
			this.setData(JSON);
		}
	};
}
