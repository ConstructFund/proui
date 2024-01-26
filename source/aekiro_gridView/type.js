"use strict";

{
	const SDK = self.SDK;
	
	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_gridView;

	BEHAVIOR_CLASS.Type = class aekiro_gridViewType extends SDK.IBehaviorTypeBase
	{
		constructor(sdkPlugin, iBehaviorType)
		{
			super(sdkPlugin, iBehaviorType);
		}
	};
}
