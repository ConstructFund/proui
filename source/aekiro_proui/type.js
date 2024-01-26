"use strict";

{
	const SDK = self.SDK;
	const C3 = self.C3;
	const PLUGIN_CLASS = SDK.Plugins.aekiro_proui;

	PLUGIN_CLASS.Type = class aekiro_prouiType extends SDK.ITypeBase
	{
		constructor(sdkPlugin, iObjectType)
		{
			super(sdkPlugin, iObjectType);
		}
	};
}
