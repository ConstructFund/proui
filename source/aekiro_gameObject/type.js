"use strict";

{
	const SDK = self.SDK;
	

	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_gameobject;

	BEHAVIOR_CLASS.Type = class aekiro_gameobjectType extends SDK.IBehaviorTypeBase
	{
		constructor(sdkPlugin, iBehaviorType)
		{
			super(sdkPlugin, iBehaviorType);
		}
	};
}
