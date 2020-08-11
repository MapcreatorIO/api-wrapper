Upgrading from @mapcreator/maps4news
------------------------------------

The following changes are important to keep in mind when upgrading from
`@mapcreator/maps4news` to `@mapcreator/api`.

 - `JobMonitor`, `JobMonitorRow` and `JobMonitorFilter` classes have been removed
 - `PaginatedResourceWrapper` and `ResourceCache` classes have been removed
   - This also removes the `PaginatedResourceListing::wrap` and `SimpleResourceProxy::listAndWrap` methods
 - `Maps4News` class has been renamed to `Mapcreator`
 - Most methods that return Promises can now be canceled using the `CancelablePromise` type
 - `axios` has been deprecated in favor of `ky`. This means that calls like `api.axios.get()` need to be rewritten
