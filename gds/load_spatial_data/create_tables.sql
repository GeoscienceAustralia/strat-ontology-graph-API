drop materialized view if exists combined_geoms;
create materialized view combined_geoms as (
	    select PROV_ENO as id, geom_3577 as geom, 'province' as dataset from province
);


CREATE INDEX gds_geom_idx ON combined_geoms USING GIST(geom);

drop table if exists combined_geom_count;

CREATE TABLE combined_geom_count (
	    geom_total_count integer    
);
INSERT INTO combined_geom_count (geom_total_count) 
(SELECT count(*) FROM combined_geoms);


