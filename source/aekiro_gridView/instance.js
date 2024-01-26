"use strict";

{
	const SDK = self.SDK;
	

	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_gridView;

	BEHAVIOR_CLASS.Instance = class aekiro_gridViewInstance extends SDK.IBehaviorInstanceBase
	{
		constructor(sdkBehType, behInst)
		{
			super(sdkBehType, behInst);
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
