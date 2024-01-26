"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gameobject.Type = class MyBehaviorType extends C3.SDKBehaviorTypeBase
	{
		constructor(behaviorType)
		{
			super(behaviorType);
		}
		
		Release()
		{
			super.Release();
		}
		
		OnCreate()
		{	
		}
	};
}
