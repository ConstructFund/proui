"use strict";

{
	const SDK = self.SDK;
	const C3 = self.C3;
	const PLUGIN_CLASS = SDK.Plugins.aekiro_proui;
	

	PLUGIN_CLASS.Instance = class aekiro_prouiInstance extends SDK.IInstanceBase
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
