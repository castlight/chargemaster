module AjWartime
  module Convert
    def self.hospital_info
      keys = ["hospital_name","city","state"]
      sql = "select distinct on (provider_number) provider_number, #{keys.to_commad_s} from reference.ipps_medicare_payments where zip_code is not null"
      data = Sql.query sql

      hospital_info = data.inject({}) do |h,c|
        vals = keys.inject({}) do |retval,key|
          key_val = key
          if key=='hospital_name'
            retval['name'] = c[key].split(/\s/).map(&:capitalize).join(" ")
          elsif key == 'state'
            retval['state'] = c[key].try(:upcase)
          elsif key == 'city'
            retval['city'] = c[key].split(/\s/).map(&:capitalize).join(" ")
          else
            retval[key_val] = c[key].try(:capitalize)
          end
          retval
        end
        h[c["provider_number"].to_i] = vals
        h
      end
      hospital_info
      File.open("/tmp/hospital_info.js","w") do |f|
         
        f.puts "var Hospitals = #{hospital_info.to_json}"
      end
    end
    
    def self.drgs
      
      sql = <<-EOSQL
       select mdc_name, string_agg(Code||','||DRG_Name,'|') drgs 
       from (select distinct on (code) * from reference.hosp_file) t
       group by 1
      EOSQL
      Sql.exec "set role dev"
      drgs = Sql.query sql
      
      mdc_info = drgs.map do |info|
        retval={}
        mdc_drgs = info["drgs"].split("|").map do |drg_info|
          drg,name = drg_info.split(',')
          {"code"=>drg,"name"=>name.try(:capitalize)}
        end
        retval["name"] = info["mdc_name"].try(:capitalize)
        retval["DRGs"] = mdc_drgs
        retval
      end
      
      File.open("/tmp/drgs.json","w") do |f|
        f.puts mdc_info.to_json
      end
    end

    def self.create_drgs 
           Sql.exec "set role dev"
      sql = "select distinct code from hosp_file"
      codes = Sql.exec_sql_to_array sql
      codes.each do |code|
        puts "Processing #{code}"
        drg_rates code
      end
    end
    
   def self.drg_rates drg
     Sql.exec "set role dev"

     sql = <<-EOSQL
      select min(drg_name) as name,min(medicare_average)||','||min(chargemaster_average) avgs , string_agg(hospital_number||','||paid||','||charges,'|') rates
      from hosp_file
      where code='#{drg}'
      group by code 
      limit 10
     EOSQL
     
     rates = Sql.query sql
     
     rates.each do |rate|
      p={}
      avgs={}
      avg_rates = rate["avgs"].split(',')
      rates = rate["rates"].split(',')
      p["name"] = rate["name"]
      p["us_average"] = {"medicare"=> (avg_rates[0].to_i)*100, "chargemaster" => (avg_rates[1].to_i)*100 }

      retval={}
        rates = rate["rates"].split("|").map do |rate_info|
          hospital,medicare,chargemaster = rate_info.split(',')
          {"hospital"=>hospital,"medicare"=>(medicare.to_i)*100,"chargemaster"=>(chargemaster.to_i)*100}
        end
     p["charges"] = rates
     File.open("/tmp/drg_rates/drg-#{drg}.js","w") do |f|
        f.puts p.to_json
      end
    nil  
     end
   end

  end
end