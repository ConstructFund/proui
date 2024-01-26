"use strict";

{
	const SDK = self.SDK;

	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_button;

	BEHAVIOR_CLASS.Instance = class aekiro_buttonInstance extends SDK.IBehaviorInstanceBase
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
