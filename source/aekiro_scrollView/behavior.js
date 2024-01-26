//Converted with C2C3AddonConverter v1.0.1.1
"use strict";

{
	const SDK = self.SDK;
	const lang = self.lang;
	const BEHAVIOR_ID = "aekiro_scrollView";
	const BEHAVIOR_VERSION = "1.817";
	const BEHAVIOR_CATEGORY = "other";
	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_scrollView = class aekiro_scrollView extends SDK.IBehaviorBase
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

			this._info.SetSupportedRuntimes(["c3"]);

			SDK.Lang.PushContext(".properties");
			this._info.SetProperties([
				new SDK.PluginProperty("combo", "is-enabled", {initialValue:"enabled", items:["disabled","enabled"]}),
				new SDK.PluginProperty("combo", "direction", {initialValue:"vertical", items:["vertical","horizontal","both"]}),
				new SDK.PluginProperty("combo", "swipe-scroll", {initialValue:"enabled", items:["disabled","enabled"]}),
				new SDK.PluginProperty("combo", "mousewheel-scroll", {initialValue:"enabled", items:["disabled","enabled"]}),
				new SDK.PluginProperty("combo", "inertia", {initialValue:"enabled", items:["disabled","enabled"]}),
				new SDK.PluginProperty("combo", "movement-type", {initialValue:"elastic", items:["clamped","elastic"]}),
				new SDK.PluginProperty("text", "content-name", ""),
				new SDK.PluginProperty("text", "vertical-slider-name", ""),
				new SDK.PluginProperty("text", "vertical-scrollbar-name", ""),
				new SDK.PluginProperty("text", "horizontal-slider-name", ""),
				new SDK.PluginProperty("text", "horizontal-scrollbar-name", ""),
				new SDK.PluginProperty("float", "mouseWheelScrollSpeed", 1)
			]);
			SDK.Lang.PopContext();		// .properties
			SDK.Lang.PopContext();
		}
	};
	BEHAVIOR_CLASS.Register(BEHAVIOR_ID, BEHAVIOR_CLASS);
}
