//Converted with C2C3AddonConverter v1.0.1.1
"use strict";

{
	const BEHAVIOR_ID = "aekiro_discreteProgressPart";
	const BEHAVIOR_VERSION = "1.818";
	const BEHAVIOR_CATEGORY = "other";
	const SDK = self.SDK;
	const lang = self.lang;
	
	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_discreteProgressPart = class aekiro_discreteProgressPart extends SDK.IBehaviorBase
	{
		constructor()
		{
			super(BEHAVIOR_ID);
			SDK.Lang.PushContext("behaviors." + BEHAVIOR_ID.toLowerCase());
			this._info.SetName(lang(".name"));
			this._info.SetDescription(lang(".description"));
			this._info.SetVersion(BEHAVIOR_VERSION);
			this._info.SetCategory(BEHAVIOR_CATEGORY);
			this._info.SetAuthor("Aekiro");
			this._info.SetHelpUrl(lang(".help-url"));
			this._info.SetIsOnlyOneAllowed(true);

			this._info.SetSupportedRuntimes(["c3"]);	// c3 for stubs only!

			SDK.Lang.PushContext(".properties");
			this._info.SetProperties([
				new SDK.PluginProperty("integer", "index", 0),
				new SDK.PluginProperty("text", "0-frame", ""),
				new SDK.PluginProperty("text", "0.5-frame", ""),
				new SDK.PluginProperty("text", "1-frame", "")
			]);
			SDK.Lang.PopContext();		// .properties
			SDK.Lang.PopContext();
		}
	};
	BEHAVIOR_CLASS.Register(BEHAVIOR_ID, BEHAVIOR_CLASS);
}