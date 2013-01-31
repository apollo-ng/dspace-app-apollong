define([
  'hbs!templates/mapContext',
  'hbs!templates/featureBoxItem',
  'hbs!templates/featureInfoModal',
  'hbs!templates/userOptionModal',
  'hbs!templates/statusPanel',
  'hbs!templates/featureOptionModal',
  'hbs!templates/controlPanel'
], function(mapContext, featureBoxItem, featureInfoModal, userOptionModal, statusPanel, featureOptionModal, controlPanel) {

  return {
    mapContext: mapContext,
    featureBoxItem: featureBoxItem,
    featureInfoModal: featureInfoModal,
    userOptionModal: userOptionModal,
    statusPanel: statusPanel,
    featureOptionModal: featureOptionModal,
    controlPanel: controlPanel
  };

});
