USE GestionProyectos;
GO

-- ============================================================
-- Proyectos
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ListarProyectosPaginado
    @Pagina INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 10;

    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    SELECT
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.FechaInicio,
        p.FechaFin,
        p.EstadoId,
        e.Nombre AS EstadoNombre,
        p.CreadoPorId,
        u.Nombre AS CreadoPorNombre,
        p.FechaCreacion
    FROM Proyectos p
    INNER JOIN Estados e ON e.Id = p.EstadoId
    INNER JOIN Usuarios u ON u.Id = p.CreadoPorId
    ORDER BY p.Id
    OFFSET @Offset ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;

    SELECT COUNT(1) AS TotalRegistros
    FROM Proyectos;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerProyectoPorId
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.FechaInicio,
        p.FechaFin,
        p.EstadoId,
        e.Nombre AS EstadoNombre,
        p.CreadoPorId,
        u.Nombre AS CreadoPorNombre,
        p.FechaCreacion
    FROM Proyectos p
    INNER JOIN Estados e ON e.Id = p.EstadoId
    INNER JOIN Usuarios u ON u.Id = p.CreadoPorId
    WHERE p.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertarProyecto
    @Nombre NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @FechaInicio DATE,
    @FechaFin DATE,
    @EstadoId INT,
    @CreadoPorId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @FechaFin < @FechaInicio
    BEGIN
        RAISERROR('La fecha fin debe ser mayor o igual a la fecha inicio.', 16, 1);
        RETURN;
    END

    INSERT INTO Proyectos (
        Nombre,
        Descripcion,
        FechaInicio,
        FechaFin,
        EstadoId,
        CreadoPorId
    )
    OUTPUT INSERTED.Id
    VALUES (
        @Nombre,
        @Descripcion,
        @FechaInicio,
        @FechaFin,
        @EstadoId,
        @CreadoPorId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_ActualizarProyecto
    @Id INT,
    @Nombre NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @FechaInicio DATE,
    @FechaFin DATE,
    @EstadoId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @Id)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF @FechaFin < @FechaInicio
    BEGIN
        RAISERROR('La fecha fin debe ser mayor o igual a la fecha inicio.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Estados
        WHERE Id = @EstadoId
          AND Nombre = 'Completada'
    )
    AND EXISTS (
        SELECT 1
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        WHERE t.ProyectoId = @Id
          AND e.Nombre NOT IN ('Completada', 'Cancelada')
    )
    BEGIN
        RAISERROR('No se puede completar un proyecto con tareas pendientes o en progreso.', 16, 1);
        RETURN;
    END

    UPDATE Proyectos
    SET
        Nombre = @Nombre,
        Descripcion = @Descripcion,
        FechaInicio = @FechaInicio,
        FechaFin = @FechaFin,
        EstadoId = @EstadoId
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_EliminarProyecto
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @Id)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        WHERE t.ProyectoId = @Id
          AND e.Nombre IN ('Pendiente', 'En Progreso')
    )
    BEGIN
        RAISERROR('No se puede eliminar un proyecto con tareas pendientes o en progreso.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM Tareas
        WHERE ProyectoId = @Id;

        DELETE FROM Proyectos
        WHERE Id = @Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO

DROP PROCEDURE IF EXISTS dbo.usp_ProyectoTieneTareasPendientesOEnProgreso;
GO

CREATE PROCEDURE dbo.usp_ProyectoTieneTareasPendientesOEnProgreso
    @ProyectoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(
        CASE WHEN EXISTS (
            SELECT 1
            FROM dbo.Tareas t
            INNER JOIN dbo.Estados e ON e.Id = t.EstadoId
            WHERE t.ProyectoId = @ProyectoId
              AND e.Nombre IN ('Pendiente', 'En Progreso')
        )
        THEN 1 ELSE 0 END
    AS BIT) AS TieneTareas;
END
GO

DROP PROCEDURE IF EXISTS dbo.usp_ProyectoTieneTareasNoFinalizadas;
GO

CREATE PROCEDURE dbo.usp_ProyectoTieneTareasNoFinalizadas
    @ProyectoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(
        CASE WHEN EXISTS (
            SELECT 1
            FROM dbo.Tareas t
            INNER JOIN dbo.Estados e ON e.Id = t.EstadoId
            WHERE t.ProyectoId = @ProyectoId
              AND e.Nombre NOT IN ('Completada', 'Cancelada')
        )
        THEN 1 ELSE 0 END
    AS BIT) AS TieneTareas;
END
GO

-- ============================================================
-- Tareas
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ListarTareasPorProyectoPaginado
    @ProyectoId INT,
    @Pagina INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 10;

    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    SELECT
        t.Id,
        t.ProyectoId,
        p.Nombre AS ProyectoNombre,
        t.Titulo,
        t.Descripcion,
        t.PrioridadId,
        pr.Nombre AS PrioridadNombre,
        t.EstadoId,
        e.Nombre AS EstadoNombre,
        t.UsuarioAsignadoId,
        u.Nombre AS UsuarioAsignadoNombre,
        t.FechaLimite,
        t.FechaCreacion
    FROM Tareas t
    INNER JOIN Proyectos p ON p.Id = t.ProyectoId
    INNER JOIN Prioridades pr ON pr.Id = t.PrioridadId
    INNER JOIN Estados e ON e.Id = t.EstadoId
    LEFT JOIN Usuarios u ON u.Id = t.UsuarioAsignadoId
    WHERE t.ProyectoId = @ProyectoId
    ORDER BY t.FechaLimite, t.Id
    OFFSET @Offset ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;

    SELECT COUNT(1) AS TotalRegistros
    FROM Tareas
    WHERE ProyectoId = @ProyectoId;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerTareaPorId
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.Id,
        t.ProyectoId,
        p.Nombre AS ProyectoNombre,
        t.Titulo,
        t.Descripcion,
        t.PrioridadId,
        pr.Nombre AS PrioridadNombre,
        t.EstadoId,
        e.Nombre AS EstadoNombre,
        t.UsuarioAsignadoId,
        u.Nombre AS UsuarioAsignadoNombre,
        t.FechaLimite,
        t.FechaCreacion
    FROM Tareas t
    INNER JOIN Proyectos p ON p.Id = t.ProyectoId
    INNER JOIN Prioridades pr ON pr.Id = t.PrioridadId
    INNER JOIN Estados e ON e.Id = t.EstadoId
    LEFT JOIN Usuarios u ON u.Id = t.UsuarioAsignadoId
    WHERE t.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertarTarea
    @ProyectoId INT,
    @Titulo NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @PrioridadId INT,
    @EstadoId INT = NULL,
    @UsuarioAsignadoId INT = NULL,
    @FechaLimite DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoPendienteId INT;

    SELECT @EstadoPendienteId = Id
    FROM Estados
    WHERE Nombre = 'Pendiente';

    IF @EstadoPendienteId IS NULL
    BEGIN
        RAISERROR('No existe el estado Pendiente.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @ProyectoId)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Prioridades WHERE Id = @PrioridadId)
    BEGIN
        RAISERROR('Prioridad no encontrada.', 16, 1);
        RETURN;
    END

    IF @UsuarioAsignadoId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM Usuarios WHERE Id = @UsuarioAsignadoId)
    BEGIN
        RAISERROR('Usuario asignado no encontrado.', 16, 1);
        RETURN;
    END

    INSERT INTO Tareas (
        ProyectoId,
        Titulo,
        Descripcion,
        PrioridadId,
        EstadoId,
        UsuarioAsignadoId,
        FechaLimite
    )
    OUTPUT INSERTED.Id
    VALUES (
        @ProyectoId,
        @Titulo,
        @Descripcion,
        @PrioridadId,
        @EstadoPendienteId,
        @UsuarioAsignadoId,
        @FechaLimite
    );
END
GO

CREATE OR ALTER PROCEDURE sp_ActualizarTarea
    @Id INT,
    @ProyectoId INT,
    @Titulo NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @PrioridadId INT,
    @EstadoId INT = NULL,
    @UsuarioAsignadoId INT = NULL,
    @FechaLimite DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoFinalId INT;

    IF NOT EXISTS (SELECT 1 FROM Tareas WHERE Id = @Id)
    BEGIN
        RAISERROR('Tarea no encontrada.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @ProyectoId)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Prioridades WHERE Id = @PrioridadId)
    BEGIN
        RAISERROR('Prioridad no encontrada.', 16, 1);
        RETURN;
    END

    IF @UsuarioAsignadoId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM Usuarios WHERE Id = @UsuarioAsignadoId)
    BEGIN
        RAISERROR('Usuario asignado no encontrado.', 16, 1);
        RETURN;
    END

    IF @EstadoId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM Estados WHERE Id = @EstadoId)
    BEGIN
        RAISERROR('Estado no encontrado.', 16, 1);
        RETURN;
    END

    SELECT @EstadoFinalId = COALESCE(@EstadoId, EstadoId)
    FROM Tareas
    WHERE Id = @Id;

    IF EXISTS (
        SELECT 1
        FROM Estados estadoTarea
        INNER JOIN Proyectos p ON p.Id = @ProyectoId
        INNER JOIN Estados estadoProyecto ON estadoProyecto.Id = p.EstadoId
        WHERE estadoTarea.Id = @EstadoFinalId
          AND estadoTarea.Nombre = 'Completada'
          AND estadoProyecto.Nombre = 'Cancelada'
    )
    BEGIN
        RAISERROR('No se puede completar una tarea si su proyecto esta cancelado.', 16, 1);
        RETURN;
    END

    UPDATE Tareas
    SET
        ProyectoId = @ProyectoId,
        Titulo = @Titulo,
        Descripcion = @Descripcion,
        PrioridadId = @PrioridadId,
        EstadoId = @EstadoFinalId,
        UsuarioAsignadoId = @UsuarioAsignadoId,
        FechaLimite = @FechaLimite
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_EliminarTarea
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Tareas WHERE Id = @Id)
    BEGIN
        RAISERROR('Tarea no encontrada.', 16, 1);
        RETURN;
    END

    DELETE FROM Tareas
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_CambiarEstadoTarea
    @Id INT,
    @EstadoId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Tareas WHERE Id = @Id)
    BEGIN
        RAISERROR('Tarea no encontrada.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Estados WHERE Id = @EstadoId)
    BEGIN
        RAISERROR('Estado no encontrado.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Tareas t
        INNER JOIN Proyectos p ON p.Id = t.ProyectoId
        INNER JOIN Estados estadoProyecto ON estadoProyecto.Id = p.EstadoId
        INNER JOIN Estados estadoTarea ON estadoTarea.Id = @EstadoId
        WHERE t.Id = @Id
          AND estadoTarea.Nombre = 'Completada'
          AND estadoProyecto.Nombre = 'Cancelada'
    )
    BEGIN
        RAISERROR('No se puede completar una tarea si su proyecto esta cancelado.', 16, 1);
        RETURN;
    END

    UPDATE Tareas
    SET EstadoId = @EstadoId
    WHERE Id = @Id;
END
GO

-- ============================================================
-- Resumen
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ObtenerResumen
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ResumenProyectos AS (
        SELECT
            SUM(CASE WHEN e.Nombre NOT IN ('Completada', 'Cancelada') THEN 1 ELSE 0 END) AS ProyectosActivos
        FROM Proyectos p
        INNER JOIN Estados e ON e.Id = p.EstadoId
    ),
    ResumenTareasPorEstado AS (
        SELECT
            e.Nombre AS EstadoNombre,
            COUNT(1) AS Total
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        GROUP BY e.Nombre
    ),
    ResumenTareasVencidas AS (
        SELECT
            COUNT(1) AS TareasVencidas
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        WHERE t.FechaLimite < CAST(GETDATE() AS DATE)
          AND e.Nombre NOT IN ('Completada', 'Cancelada')
    )
    SELECT
        ISNULL(rp.ProyectosActivos, 0) AS ProyectosActivos,
        ISNULL(rtv.TareasVencidas, 0) AS TareasVencidas,
        ISNULL(SUM(CASE WHEN rte.EstadoNombre = 'Pendiente' THEN rte.Total ELSE 0 END), 0) AS TareasPendientes
    FROM ResumenProyectos rp
    CROSS JOIN ResumenTareasVencidas rtv
    LEFT JOIN ResumenTareasPorEstado rte ON 1 = 1
    GROUP BY rp.ProyectosActivos, rtv.TareasVencidas;
END
GO
