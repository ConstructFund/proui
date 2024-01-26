"use strict";

{
	const SDK = self.SDK;
	
	const PLUGIN_CLASS = SDK.Plugins.aekiro_translation;

	PLUGIN_CLASS.Instance = class aekiro_translationInstance extends SDK.IInstanceBase
	{
		constructor(sdkType, inst)
		{
			super(sdkType, inst);
		}
		Release()
		{
		}
		OnCreate()
		{
		}
		OnPropertyChanged(id, value)
		{
		}
		LoadC2Property(name, valueString)
		{
			return false;       // not handled
		}
	};
}
