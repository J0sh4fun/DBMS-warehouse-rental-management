package com.example.dbmswarehouserentalmanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class DbmsSchemaObjectsInitializer {

    private static final Logger log = LoggerFactory.getLogger(DbmsSchemaObjectsInitializer.class);

    private final DataSource dataSource;
    private final ResourceLoader resourceLoader;

    public DbmsSchemaObjectsInitializer(DataSource dataSource, ResourceLoader resourceLoader) {
        this.dataSource = dataSource;
        this.resourceLoader = resourceLoader;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public void initializeSchemaObjects() {
        List<String> statements = loadDbmsStatements();
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            for (String sql : statements) {
                statement.execute(sql);
            }
            log.info("Initialized {} DBMS object statements from dbms_objects.sql", statements.size());
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to initialize DBMS objects from dbms_objects.sql", ex);
        }
    }

    private List<String> loadDbmsStatements() {
        Resource resource = resourceLoader.getResource("classpath:dbms_objects.sql");
        List<String> statements = new ArrayList<>();
        String delimiter = ";";
        StringBuilder currentStatement = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();

                if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                    continue;
                }

                if (trimmed.regionMatches(true, 0, "DELIMITER ", 0, "DELIMITER ".length())) {
                    delimiter = trimmed.substring("DELIMITER ".length()).trim();
                    continue;
                }

                currentStatement.append(line).append('\n');
                if (endsWithDelimiter(currentStatement, delimiter)) {
                    String sql = stripTrailingDelimiter(currentStatement.toString(), delimiter).trim();
                    currentStatement.setLength(0);
                    if (!sql.isBlank() && shouldExecute(sql)) {
                        statements.add(sql);
                    }
                }
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to read dbms_objects.sql", ex);
        }

        return statements;
    }

    private boolean shouldExecute(String sql) {
        String normalized = sql.stripLeading().toUpperCase(Locale.ROOT);
        return !normalized.startsWith("DROP TABLE") && !normalized.startsWith("CREATE TABLE");
    }

    private boolean endsWithDelimiter(StringBuilder statement, String delimiter) {
        return statement.toString().trim().endsWith(delimiter);
    }

    private String stripTrailingDelimiter(String sql, String delimiter) {
        String trimmed = sql.trim();
        return trimmed.substring(0, trimmed.length() - delimiter.length());
    }
}
