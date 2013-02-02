define([
  'hbs!templates/mapContext',
  'hbs!templates/featureBoxItem',
  'hbs!templates/featureInfoModal',
  'hbs!templates/userOptionModal',
  'hbs!templates/statusPanel',
  'hbs!templates/featureOptionModal',
  'hbs!templates/controlPanel',
  'hbs!templates/addFeature',
  'hbs!templates/featureDetails',
  'hbs!templates/featureBox'
], function(mapContext, featureBoxItem, featureInfoModal, userOptionModal, statusPanel, featureOptionModal, controlPanel, addFeature, featureDetails, featureBox) {

  return {
    mapContext: mapContext,
    featureBoxItem: featureBoxItem,
    featureInfoModal: featureInfoModal,
    userOptionModal: userOptionModal,
    statusPanel: statusPanel,
    featureOptionModal: featureOptionModal,
    controlPanel: controlPanel,
    addFeature: addFeature,
    featureDetails: featureDetails,
    featureBox: featureBox
  };

});
