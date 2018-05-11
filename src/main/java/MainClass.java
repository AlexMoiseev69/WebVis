import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

/**
 * Created by user on 28.02.2017.
 */
@SpringBootApplication
@ComponentScan
public class MainClass {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(new Class[]{Example.class, MainController.class}, args);
    }

}
