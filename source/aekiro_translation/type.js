"use strict";

{
	const SDK = self.SDK;
	

	const PLUGIN_CLASS = SDK.Plugins.aekiro_translation;

	PLUGIN_CLASS.Type = class aekiro_translationType extends SDK.ITypeBase
	{
		constructor(sdkPlugin, iObjectType)
		{
			super(sdkPlugin, iObjectType);
		}
	};
}
